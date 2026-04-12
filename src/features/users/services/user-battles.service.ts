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
import { UserBattleQueryCache, resolveBattleQueryCacheTtlMs } from './user-battles/user-battle-cache';
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

type BattleRepository = Repository<UserBattlesNormal> | Repository<UserBattlesRanked>;

@Injectable()
export class UserBattlesService {
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
    const queryFilter = await resolveBattleQueryFilter(request, {
      getTypeList: () => this.configService.getTypeList(),
      selectModeList: () => this.modesService.selectModeList()
    });

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
    const queryFilter = await resolveBattleQueryFilter(request, {
      getTypeList: () => this.configService.getTypeList(),
      selectModeList: () => this.modesService.selectModeList()
    });

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
    const [dailyBattleCountSummary, dailyTrophyChangeSummary] =
      await Promise.all([
        this.createBattleQueryBuilder(queryFilter.type, 'uBattle')
          .select('DATE_FORMAT(uBattle.battleTime, "%Y-%m-%d")', 'day')
          .addSelect('COUNT(uBattle.battleTime)', 'value')
          .innerJoin(GameMaps, 'map', 'uBattle.mapID = map.id')
          .where('uBattle.userID = :id AND uBattle.playerID = :id', {
            id: `#${id}`
          })
          .andWhere('uBattle.matchType IN (:...type)', {
            type: queryFilter.matchType
          })
          .andWhere('map.mode IN (:...mode)', {
            mode: queryFilter.matchMode
          })
          .andWhere(battleSeasonWhereClause, seasonWhereParams)
          .groupBy('DATE_FORMAT(uBattle.battleTime, "%Y-%m-%d")')
          .getRawMany<BattleSummaryRawRow>(),
        this.createBattleQueryBuilder(queryFilter.type, 'uBattle')
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
          })
          .andWhere('map.mode IN (:...mode)', {
            mode: queryFilter.matchMode
          })
          .andWhere(battleSeasonWhereClause, seasonWhereParams)
          .groupBy('DATE_FORMAT(uBattle.battleTime, "%Y-%m-%d")')
          .getRawMany<BattleSummaryRawRow>()
      ]);

    return buildSummaryBattles([
      dailyBattleCountSummary,
      dailyTrophyChangeSummary
    ]);
  }

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
      })
      .andWhere('map.mode IN (:...mode)', {
        mode: queryFilter.matchMode
      })
      .andWhere(battlesSeasonWhereClause, seasonWhereParams)
      .groupBy('DATE(uBattles.battleTime)');

    // 일별 총 전투 수를 서브쿼리로 고정해둬야 픽률 계산이 브롤러별 집계와 어긋나지 않는다.
    const dailyBrawlerStats = await this.createBattleQueryBuilder(
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
      })
      .andWhere('map.mode IN (:...mode)', {
        mode: queryFilter.matchMode
      })
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

    return this.createBattleQueryBuilder(queryFilter.type, 'uBattle')
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
      })
      .andWhere('map.mode IN (:...mode)', {
        mode: queryFilter.matchMode
      })
      .andWhere(battleSeasonWhereClause, seasonWhereParams)
      .orderBy('uBattle.battleTime', 'DESC')
      .limit(limit)
      .getRawMany<SelectRecentUserBattlesDto>();
  }

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
    return this.createBattleQueryBuilder(queryFilter.type, 'uBattle')
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
      })
      .andWhere('map.mode IN (:...mode)', {
        mode: queryFilter.matchMode
      })
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

  private createBattleQueryBuilder(
    type: string,
    alias: string
  ): SelectQueryBuilder<UserBattlesNormal | UserBattlesRanked> {
    if (type === '7') {
      return this.userBattlesNormal.manager
        .createQueryBuilder()
        .from(`(${this.getUnionBattleSubQuery()})`, alias) as SelectQueryBuilder<
        UserBattlesNormal | UserBattlesRanked
      >;
    }

    return this.getBattleRepositoryByType(type).createQueryBuilder(alias);
  }

  private getBattleRepositoryByType(type: string): BattleRepository {
    return type === '2' || type === '3'
      ? this.userBattlesRanked
      : this.userBattlesNormal;
  }

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
