import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import { AppConfigService } from '~/utils/services/app-config.service';
import { SeasonsService } from '~/seasons/seasons.service';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';
import { UserBattlesNormal } from '~/users/entities/user-battles-normal.entity';
import { UserBattlesRanked } from '~/users/entities/user-battles-ranked.entity';
import { UserBrawlerBattles } from '~/users/entities/user-brawlers.entity';
import { GameMaps } from '~/maps/entities/maps.entity';
import {
  SelectRecentUserBattlesDto,
  SelectUserBattleLogsDto,
  SelectUserBattlesDto,
  SelectUserSummaryBattlesDto
} from '~/users/dto/select-user-battles.dto';
import { ModesService } from '~/maps/services/modes.service';
import {
  UserBattleQueryCache,
  resolveBattleQueryCacheTtlMs
} from './user-battles/user-battle-cache';
import {
  normalizeBattleRequest,
  resolveBattleQueryFilter
} from './user-battles/user-battle-filters';
import {
  buildDailyBrawlerGroups,
  buildRecentBattleCollections,
  buildSummaryBattles,
  mergeBattleLogsWithRecentBattles,
  prependAllMode
} from './user-battles/user-battle-mappers';
import {
  getSeasonWhereClause,
  getSeasonWhereParams,
  getSeasonWindow
} from './user-battles/user-battle-season';
import {
  BattleQueryFilter,
  BattleSummaryRawRow,
  DailyBrawlerGroupType,
  DailyBrawlerStatRawRow,
  SeasonWindowType,
  UserBattleLogRawRow,
  UserBattleModeRawRow,
  UserBattleModesResult,
  UserDailyBattlesResult
} from './user-battles/user-battle.types';

type BattleRepository =
  | Repository<UserBattlesNormal>
  | Repository<UserBattlesRanked>;

/**
 * 사용자 배틀 통계와 로그 조회 API의 쿼리 조립을 담당합니다.
 *
 * 시즌 필터, 타입별 테이블 선택, 응답 매핑, 짧은 TTL 캐시를 한 곳에서 맞춰
 * 프론트엔드가 기대하는 `/brawlian/:id/battles/*` 응답 형식을 유지합니다.
 */
@Injectable()
export class UserBattlesService {
  /**
   * 같은 사용자/필터 조합의 반복 조회를 흡수하는 프로세스 로컬 쿼리 캐시입니다.
   */
  private readonly queryCache = new UserBattleQueryCache(
    resolveBattleQueryCacheTtlMs(process.env.USER_BATTLES_QUERY_CACHE_TTL_MS)
  );

  constructor(
    @InjectRepository(UserBattlesNormal)
    private readonly userBattlesNormal: Repository<UserBattlesNormal>,
    @InjectRepository(UserBattlesRanked)
    private readonly userBattlesRanked: Repository<UserBattlesRanked>,
    @InjectRepository(UserBrawlerBattles)
    private readonly userBrawlerBattles: Repository<UserBrawlerBattles>,
    private readonly modesService: ModesService,
    private readonly seasonsService: SeasonsService,
    private readonly configService: AppConfigService
  ) {}

  /**
   * 일별 배틀 수, 트로피 변화량, 브롤러별 일별 통계를 조회합니다.
   */
  async selectUserDailyBattles(
    id: string,
    type: string,
    mode: string
  ): Promise<UserDailyBattlesResult> {
    const request = normalizeBattleRequest(type, mode);
    const cacheKey = this.queryCache.buildKey(
      'user-daily-battles',
      id,
      request.type,
      request.mode
    );
    const cached = this.queryCache.get<UserDailyBattlesResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const seasonWindow = getSeasonWindow(request.type, this.seasonsService);
    const queryFilter = await this.resolveQueryFilter(request);

    const [summaryBattles, dailyBrawlers] = await Promise.all([
      this.loadDailyBattleSummaries(id, queryFilter, seasonWindow),
      this.loadDailyBrawlerGroups(id, queryFilter, seasonWindow)
    ]);

    const result = {
      summaryBattles,
      dailyBrawlers,
      season: seasonWindow.responseSeason
    };
    this.queryCache.set(cacheKey, result);

    return result;
  }

  /**
   * 최근 전투 목록과 상세 로그를 같은 필터/시즌 기준으로 조회합니다.
   */
  async selectUserBattleLogs(
    id: string,
    type: string,
    mode: string,
    stack: number
  ): Promise<SelectUserBattleLogsDto> {
    const request = normalizeBattleRequest(type, mode, stack);
    const cacheKey = this.queryCache.buildKey(
      'user-battle-logs',
      id,
      request.type,
      request.mode,
      request.stack
    );
    const cached = this.queryCache.get<SelectUserBattleLogsDto>(cacheKey);
    if (cached) {
      return cached;
    }

    const seasonWindow = getSeasonWindow(request.type, this.seasonsService);
    const queryFilter = await this.resolveQueryFilter(request);

    const recentUserBattles = await this.loadRecentUserBattles(
      id,
      queryFilter,
      seasonWindow
    );
    const { recentBattlesByBattleTime, userBrawlerBattles } =
      buildRecentBattleCollections(recentUserBattles);
    const rawUserBattleLogs = await this.loadDetailedBattleLogs(
      id,
      queryFilter,
      seasonWindow
    );
    const userBattleLogs = mergeBattleLogsWithRecentBattles(
      rawUserBattleLogs,
      recentBattlesByBattleTime
    );

    const result = { recentUserBattles, userBrawlerBattles, userBattleLogs };
    this.queryCache.set(cacheKey, result);

    return result;
  }

  /**
   * 사용자가 플레이한 트로피/랭크 모드 목록을 조회합니다.
   */
  async selectUserBattleModes(id: string): Promise<UserBattleModesResult> {
    const cacheKey = this.queryCache.buildKey('user-battle-modes', id);
    const cached = this.queryCache.get<UserBattleModesResult>(cacheKey);
    if (cached) {
      return cached;
    }

    const [modeTLResults, modePLResults] = await Promise.all([
      this.userBrawlerBattles
        .createQueryBuilder('uBrawlerBattles')
        .select('uBrawlerBattles.mode', 'modeName')
        .where('uBrawlerBattles.userID = :id', {
          id: `#${id}`
        })
        .andWhere('uBrawlerBattles.matchType = 0')
        .groupBy('uBrawlerBattles.mode')
        .getRawMany<UserBattleModeRawRow>(),
      this.userBrawlerBattles
        .createQueryBuilder('uBrawlerBattles')
        .select('uBrawlerBattles.mode', 'modeName')
        .where('uBrawlerBattles.userID = :id', {
          id: `#${id}`
        })
        .andWhere('uBrawlerBattles.matchType IN (2, 3)')
        .groupBy('uBrawlerBattles.mode')
        .getRawMany<UserBattleModeRawRow>()
    ]);

    const result = {
      season: this.seasonsService.getRecentAllBattleSeason(),
      modeTL: prependAllMode(modeTLResults),
      modePL: prependAllMode(modePLResults)
    };
    this.queryCache.set(cacheKey, result);

    return result;
  }

  /**
   * 요청 타입과 모드 값을 DB 쿼리에 사용할 구체 필터로 변환합니다.
   */
  private async resolveQueryFilter(
    request: ReturnType<typeof normalizeBattleRequest>
  ): Promise<BattleQueryFilter> {
    return resolveBattleQueryFilter(request, {
      getTypeList: () => this.configService.getTypeList(),
      selectModeList: () => this.modesService.selectModeList()
    });
  }

  /**
   * 캘린더 상단 요약 그래프에 필요한 일별 집계를 조회합니다.
   */
  private async loadDailyBattleSummaries(
    id: string,
    queryFilter: BattleQueryFilter,
    seasonWindow: SeasonWindowType
  ): Promise<SelectUserSummaryBattlesDto[][]> {
    const seasonWhereParams = getSeasonWhereParams(
      seasonWindow,
      queryFilter.type
    );
    const battleSeasonWhereClause = getSeasonWhereClause(
      'uBattle',
      queryFilter.type
    );

    // 날짜별 전투 수와 트로피 변화량은 같은 조건으로 집계해야 캘린더가 정확히 맞물린다.
    const dailyBattleCountQuery = this.createBattleQueryBuilder(
      queryFilter.type,
      'uBattle'
    )
      .select('DATE_FORMAT(uBattle.battleTime, "%Y-%m-%d")', 'day')
      .addSelect('COUNT(uBattle.battleTime)', 'value')
      .innerJoin(GameMaps, 'map', 'uBattle.mapID = map.id')
      .where('uBattle.userID = :id AND uBattle.playerID = :id', {
        id: `#${id}`
      })
      .andWhere('uBattle.matchType IN (:...type)', {
        type: queryFilter.matchType
      });
    this.applyMatchModeFilter(dailyBattleCountQuery, queryFilter.matchMode);

    const dailyTrophyChangeQuery = this.createBattleQueryBuilder(
      queryFilter.type,
      'uBattle'
    )
      .select('DATE_FORMAT(uBattle.battleTime, "%Y-%m-%d")', 'day')
      .addSelect(
        'SUM(CASE WHEN uBattle.matchType NOT IN (4, 5) THEN uBattle.trophyChange ELSE 0 END)',
        'value'
      )
      .innerJoin(GameMaps, 'map', 'uBattle.mapID = map.id')
      .where('uBattle.userID = :id AND uBattle.playerID = :id', {
        id: `#${id}`
      })
      .andWhere('uBattle.matchType IN (:...type)', {
        type: queryFilter.matchType
      });
    this.applyMatchModeFilter(dailyTrophyChangeQuery, queryFilter.matchMode);

    const [dailyBattleCountSummary, dailyTrophyChangeSummary] =
      await Promise.all([
        dailyBattleCountQuery
          .andWhere(battleSeasonWhereClause, seasonWhereParams)
          .groupBy('DATE_FORMAT(uBattle.battleTime, "%Y-%m-%d")')
          .getRawMany<BattleSummaryRawRow>(),
        dailyTrophyChangeQuery
          .andWhere(battleSeasonWhereClause, seasonWhereParams)
          .groupBy('DATE_FORMAT(uBattle.battleTime, "%Y-%m-%d")')
          .getRawMany<BattleSummaryRawRow>()
      ]);

    return buildSummaryBattles([
      dailyBattleCountSummary,
      dailyTrophyChangeSummary
    ]);
  }

  /**
   * 날짜별 브롤러 픽/승패 집계를 조회합니다.
   */
  private async loadDailyBrawlerGroups(
    id: string,
    queryFilter: BattleQueryFilter,
    seasonWindow: SeasonWindowType
  ): Promise<DailyBrawlerGroupType[]> {
    const seasonWhereParams = getSeasonWhereParams(
      seasonWindow,
      queryFilter.type
    );
    const battlesSeasonWhereClause = getSeasonWhereClause(
      'uBattles',
      queryFilter.type
    );

    const dailyStatsQuery = this.createBattleQueryBuilder(
      queryFilter.type,
      'uBattles'
    )
      .select('DATE(uBattles.battleTime)', 'date')
      .addSelect('COUNT(*)', 'dailyTotalCount')
      .innerJoin(GameMaps, 'map', 'uBattles.mapID = map.id')
      .where('uBattles.userID = :id AND uBattles.playerID = :id', {
        id: `#${id}`
      })
      .andWhere('uBattles.matchType IN (:...type)', {
        type: queryFilter.matchType
      });
    this.applyMatchModeFilter(dailyStatsQuery, queryFilter.matchMode);
    dailyStatsQuery
      .andWhere(battlesSeasonWhereClause, seasonWhereParams)
      .groupBy('DATE(uBattles.battleTime)');

    // 일별 총 전투 수를 서브쿼리로 고정해둬야 픽률 계산이 브롤러별 집계와 어긋나지 않는다.
    const dailyBrawlerStatsQuery = this.createBattleQueryBuilder(
      queryFilter.type,
      'uBattles'
    )
      .select('uBattles.brawlerID', 'brawlerID')
      .addSelect('brawler.name', 'brawlerName')
      .addSelect('DATE(uBattles.battleTime)', 'date')
      .addSelect('COUNT(*)', 'matchCount')
      .addSelect(
        'SUM(CASE WHEN uBattles.gameResult = -1 THEN 1 ELSE 0 END)',
        'victoriesCount'
      )
      .addSelect(
        'SUM(CASE WHEN uBattles.gameResult = 1 THEN 1 ELSE 0 END)',
        'defeatsCount'
      )
      .addSelect('dailyBattles.dailyTotalCount', 'dailyTotalCount')
      .innerJoin(
        `(${dailyStatsQuery.getQuery()})`,
        'dailyBattles',
        'dailyBattles.date = DATE(uBattles.battleTime)'
      )
      .innerJoin(Brawlers, 'brawler', 'uBattles.brawlerID = brawler.id')
      .innerJoin(GameMaps, 'map', 'uBattles.mapID = map.id')
      .where('uBattles.userID = :id AND uBattles.playerID = :id', {
        id: `#${id}`
      })
      .andWhere('uBattles.matchType IN (:...type)', {
        type: queryFilter.matchType
      });
    this.applyMatchModeFilter(dailyBrawlerStatsQuery, queryFilter.matchMode);

    const dailyBrawlerStats = await dailyBrawlerStatsQuery
      .andWhere(battlesSeasonWhereClause, seasonWhereParams)
      .groupBy('DATE(uBattles.battleTime)')
      .addGroupBy('uBattles.brawlerID')
      .addGroupBy('brawler.name')
      .addGroupBy('dailyBattles.dailyTotalCount')
      .orderBy('date', 'ASC')
      .addOrderBy('brawler.id', 'ASC')
      .getRawMany<DailyBrawlerStatRawRow>();

    return buildDailyBrawlerGroups(dailyBrawlerStats);
  }

  /**
   * 로그 상단에 노출할 최근 전투 카드 목록을 조회합니다.
   */
  private async loadRecentUserBattles(
    id: string,
    queryFilter: BattleQueryFilter,
    seasonWindow: SeasonWindowType
  ): Promise<SelectRecentUserBattlesDto[]> {
    const seasonWhereParams = getSeasonWhereParams(
      seasonWindow,
      queryFilter.type
    );
    const battleSeasonWhereClause = getSeasonWhereClause(
      'uBattle',
      queryFilter.type
    );
    const limit = 30 * queryFilter.stack;

    const recentBattlesQuery = this.createBattleQueryBuilder(
      queryFilter.type,
      'uBattle'
    )
      .select('uBattle.battleTime', 'battleTime')
      .addSelect('uBattle.duration', 'duration')
      .addSelect('uBattle.brawlerID', 'brawlerID')
      .addSelect('uBattle.gameResult', 'gameResult')
      .addSelect('uBattle.mapID', 'mapID')
      .addSelect('uBattle.isStarPlayer', 'isStarPlayer')
      .addSelect('map.mode', 'mode')
      .addSelect('map.name', 'mapName')
      .addSelect('brawler.name', 'brawlerName')
      .addSelect('brawler.role', 'role')
      .innerJoin(Brawlers, 'brawler', 'uBattle.brawlerID = brawler.id')
      .innerJoin(GameMaps, 'map', 'uBattle.mapID = map.id')
      .where('uBattle.userID = :id AND uBattle.playerID = :id', {
        id: `#${id}`
      })
      .andWhere('uBattle.matchType IN (:...type)', {
        type: queryFilter.matchType
      });
    this.applyMatchModeFilter(recentBattlesQuery, queryFilter.matchMode);

    return recentBattlesQuery
      .andWhere(battleSeasonWhereClause, seasonWhereParams)
      .orderBy('uBattle.battleTime', 'DESC')
      .limit(limit)
      .getRawMany<SelectRecentUserBattlesDto>();
  }

  /**
   * 배틀 단위 상세 로그의 원시 JSON 집계 행을 조회합니다.
   */
  private async loadDetailedBattleLogs(
    id: string,
    queryFilter: BattleQueryFilter,
    seasonWindow: SeasonWindowType
  ): Promise<UserBattleLogRawRow[]> {
    const seasonWhereParams = getSeasonWhereParams(
      seasonWindow,
      queryFilter.type
    );
    const battleSeasonWhereClause = getSeasonWhereClause(
      'uBattle',
      queryFilter.type
    );
    const limit = 30 * queryFilter.stack;

    // 배틀 단위로 플레이어 목록을 JSON으로 묶어야 기존 로그 응답 키를 그대로 유지할 수 있다.
    const battleLogsQuery = this.createBattleQueryBuilder(
      queryFilter.type,
      'uBattle'
    )
      .select('uBattle.userID', 'userID')
      .addSelect(
        'JSON_OBJECT(' +
          '"userID", uBattle.userID,' +
          '"battleTime", uBattle.battleTime,' +
          '"duration", uBattle.duration,' +
          '"matchType", uBattle.matchType,' +
          '"modeCode", uBattle.modeCode,' +
          '"matchGrade", uBattle.matchGrade,' +
          '"trophyChange", uBattle.trophyChange)',
        'battleInfo'
      )
      .addSelect(
        'JSON_ARRAYAGG(' +
          'JSON_OBJECT(' +
          '"playerID", uBattle.playerID,' +
          '"playerName", uBattle.playerName,' +
          '"teamNumber", uBattle.teamNumber,' +
          '"brawlerID", uBattle.brawlerID,' +
          '"brawlerPower", uBattle.brawlerPower,' +
          '"brawlerTrophies", uBattle.brawlerTrophies,' +
          '"gameRank", uBattle.gameRank,' +
          '"gameResult", uBattle.gameResult,' +
          '"isStarPlayer", uBattle.isStarPlayer))',
        'battlePlayers'
      )
      .innerJoin(GameMaps, 'map', 'uBattle.mapID = map.id')
      .where('uBattle.userID = :id', {
        id: `#${id}`
      })
      .andWhere('uBattle.matchType IN (:...type)', {
        type: queryFilter.matchType
      });
    this.applyMatchModeFilter(battleLogsQuery, queryFilter.matchMode);

    return battleLogsQuery
      .andWhere(battleSeasonWhereClause, seasonWhereParams)
      .groupBy('uBattle.userID')
      .addGroupBy('uBattle.battleTime')
      .addGroupBy('uBattle.duration')
      .addGroupBy('uBattle.matchType')
      .addGroupBy('uBattle.modeCode')
      .addGroupBy('uBattle.matchGrade')
      .addGroupBy('uBattle.trophyChange')
      .orderBy('uBattle.battleTime', 'DESC')
      .limit(limit)
      .getRawMany<UserBattleLogRawRow>();
  }

  /**
   * 타입 필터에 맞는 전투 테이블 쿼리 빌더를 생성합니다.
   */
  private createBattleQueryBuilder(
    type: string,
    alias: string
  ): SelectQueryBuilder<UserBattlesNormal | UserBattlesRanked> {
    if (type === '7') {
      // 전체 타입은 일반/랭크 테이블을 동일 별칭으로 합쳐 후속 매퍼가 단일 테이블처럼 처리하게 한다.
      return this.userBattlesNormal.manager
        .createQueryBuilder()
        .from(
          `(${this.getUnionBattleSubQuery()})`,
          alias
        ) as SelectQueryBuilder<UserBattlesNormal | UserBattlesRanked>;
    }

    return this.getBattleRepositoryByType(type).createQueryBuilder(alias);
  }

  /**
   * 요청 타입에 따라 일반 또는 랭크 배틀 저장소를 선택합니다.
   */
  private getBattleRepositoryByType(type: string): BattleRepository {
    return type === '2' || type === '3'
      ? this.userBattlesRanked
      : this.userBattlesNormal;
  }

  /**
   * 구체 모드 필터가 있을 때만 지도 모드 조건을 추가합니다.
   */
  private applyMatchModeFilter(
    queryBuilder: SelectQueryBuilder<UserBattlesNormal | UserBattlesRanked>,
    matchMode: string[]
  ): void {
    if (matchMode.length === 0) {
      return;
    }

    queryBuilder.andWhere('map.mode IN (:...mode)', {
      mode: matchMode
    });
  }

  /**
   * 일반/랭크 배틀 테이블을 같은 컬럼 별칭으로 합치는 UNION 서브쿼리를 만듭니다.
   */
  private getUnionBattleSubQuery(): string {
    const selectClause = `
      user_id AS userID,
      player_id AS playerID,
      brawler_id AS brawlerID,
      battle_time AS battleTime,
      map_id AS mapID,
      mode_code AS modeCode,
      match_type AS matchType,
      match_grade AS matchGrade,
      duration AS duration,
      game_rank AS gameRank,
      game_result AS gameResult,
      trophy_change AS trophyChange,
      duels_trophy_change AS duelsTrophyChange,
      player_name AS playerName,
      team_number AS teamNumber,
      is_team_player AS isTeamPlayer,
      is_star_player AS isStarPlayer,
      brawler_power AS brawlerPower,
      brawler_trophies AS brawlerTrophies
    `;

    return `
      SELECT ${selectClause} FROM \`user_battles_normal\`
      UNION ALL
      SELECT ${selectClause} FROM \`user_battles_ranked\`
    `;
  }
}
