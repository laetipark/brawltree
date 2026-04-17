import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BattleStats } from '~/brawlers/entities/battle-stats.entity';
import { SelectMapDto, SelectMapStatsDto } from '~/maps/dto/select-map.dto';
import { GameMapRotation } from '~/maps/entities/map-rotation.entity';
import { GameMaps } from '~/maps/entities/maps.entity';
import { BattleService } from '~/utils/services/battle.service';

type MapNameRow = {
  name: string;
};

type MapIdRow = {
  id: string;
};

@Injectable()
export class MapsService {
  constructor(
    @InjectRepository(BattleStats)
    private readonly battleStats: Repository<BattleStats>,
    @InjectRepository(GameMaps)
    private readonly maps: Repository<GameMaps>,
    private readonly battleService: BattleService
  ) {}

  /** 맵 이름에 해당하는 대표 로테이션 맵 정보를 반환합니다. */
  async selectMap(name: string): Promise<SelectMapDto | null> {
    const maps = await this.maps
      .createQueryBuilder('map')
      .select('map.id', 'mapID')
      .addSelect('map.name', 'mapName')
      .addSelect('map.mode', 'mode')
      .addSelect('mRotation.isTrophyLeague', 'isTrophyLeague')
      .addSelect('mRotation.isPowerLeague', 'isPowerLeague')
      .leftJoin(GameMapRotation, 'mRotation', 'mRotation.mapID = map.id')
      .where('map.name = :name', {
        name
      })
      .getRawMany<SelectMapDto>();

    return this.findPreferredRotationMap(maps);
  }

  /** 맵 이름 또는 맵 ID 기준으로 같은 이름의 맵 전투 통계를 반환합니다. */
  async selectMapStats(
    mapIdentifier: string,
    type: string,
    grade: string[],
    limit?: number
  ): Promise<SelectMapStatsDto[]> {
    const matchGrade = this.battleService.setMatchGrade(type, grade);
    if (!matchGrade.length) {
      return [];
    }

    const mapName = await this.maps
      .createQueryBuilder('maps')
      .select('maps.name', 'name')
      .where('maps.name = :mapIdentifier', {
        mapIdentifier
      })
      .orWhere('maps.id = :mapIdentifier', {
        mapIdentifier
      })
      .limit(1)
      .getRawOne<MapNameRow>();

    if (!mapName) {
      return [];
    }

    const mapIDs = await this.maps
      .createQueryBuilder('maps')
      .select('maps.id', 'id')
      .where('maps.name = :name', {
        name: mapName.name
      })
      .getRawMany<MapIdRow>()
      .then((maps) => maps.map((map) => map.id));

    if (!mapIDs.length) {
      return [];
    }

    const query = this.battleStats
      .createQueryBuilder('battleStats')
      .select('battleStats.brawlerID', 'brawlerID')
      .addSelect(
        'ROUND(SUM(battleStats.matchCount) * 100 / SUM(SUM(battleStats.matchCount)) OVER(), 2)',
        'pickRate'
      )
      .addSelect(
        'ROUND(SUM(battleStats.victoriesCount) * 100 / (SUM(battleStats.victoriesCount) + SUM(battleStats.defeatsCount)), 2)',
        'victoryRate'
      )
      .addSelect('brawler.name', 'brawlerName')
      .leftJoin('battleStats.brawler', 'brawler')
      .where('battleStats.mapID IN (:...ids)', {
        ids: mapIDs
      })
      .andWhere('battleStats.matchType = :type', {
        type
      })
      .andWhere('battleStats.matchGrade IN (:...grade)', {
        grade: matchGrade
      })
      .groupBy('battleStats.brawlerID')
      .addGroupBy('brawler.name')
      .orderBy('pickRate', 'DESC')
      .addOrderBy('victoryRate', 'DESC');

    if (limit) {
      query.limit(limit);
    }

    return query.getRawMany<SelectMapStatsDto>();
  }

  /** 모든 맵 목록을 모드별로 묶어 반환합니다. */
  async selectMaps(): Promise<Record<string, SelectMapDto[]>> {
    const maps = await this.maps
      .createQueryBuilder('map')
      .select('MAX(map.id)', 'mapID')
      .addSelect('map.name', 'mapName')
      .addSelect('map.mode', 'mode')
      .groupBy('map.name')
      .addGroupBy('map.mode')
      .getRawMany<SelectMapDto>();

    return maps.reduce((acc, map) => {
      const mode = map.mode;

      if (!acc[mode]) {
        acc[mode] = [];
      }

      if (!acc[mode].find((m) => m.mapID === map.mapID)) {
        acc[mode].push(map);
      }

      return acc;
    }, {} as Record<string, SelectMapDto[]>);
  }

  /** 맵 이름과 선택 모드에 해당하는 맵 정보를 반환합니다. */
  async selectMapByName(
    name: string,
    mode?: string
  ): Promise<SelectMapDto | null> {
    const query = this.maps
      .createQueryBuilder('map')
      .select('map.id', 'mapID')
      .addSelect('map.name', 'mapName')
      .addSelect('map.mode', 'mode')
      .leftJoin(GameMapRotation, 'mRotation', 'mRotation.mapID = map.id')
      .where('map.name = :name', {
        name
      });

    if (mode) {
      query.andWhere('map.mode = :mode', {
        mode
      });
    }

    return query.getRawOne<SelectMapDto>();
  }

  private findPreferredRotationMap(maps: SelectMapDto[]): SelectMapDto | null {
    const bothLeagueMap = maps.find(
      (item) => item.isTrophyLeague && item.isPowerLeague
    );
    if (bothLeagueMap) {
      return bothLeagueMap;
    }

    const rotationMap = maps.find(
      (item) => item.isTrophyLeague || item.isPowerLeague
    );

    return rotationMap || maps[0] || null;
  }
}
