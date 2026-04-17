import { Controller, Get, NotFoundException, Param, Query } from '@nestjs/common';

import { MapsService } from '../services/maps.service';

@Controller('maps')
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  /** 로테이션 맵 목록 조회 */
  @Get('/')
  async selectMaps() {
    return {
      maps: await this.mapsService.selectMaps()
    };
  }

  /** 맵 이름에 대한 상세 정보 및 전투 통계 조회 */
  @Get('/:name')
  async selectMap(
    @Param('name') name: string,
    @Query('type') type: string,
    @Query('grade') grade: string[]
  ) {
    const map = await this.mapsService.selectMap(name);
    if (!map) {
      throw new NotFoundException('Map not found');
    }

    const matchType = !map.isTrophyLeague && map.isPowerLeague ? '2' : type;

    return {
      map,
      stats: await this.mapsService.selectMapStats(name, matchType, grade)
    };
  }

  /** 맵 이름, 모드에 대한 상세 정보 및 전투 통계 조회 */
  @Get('/name/detail')
  async selectMapSummary(
    @Query('name') name: string,
    @Query('type') type: string,
    @Query('grade') grade: string[],
    @Query('mode') mode?: string
  ) {
    const map = await this.mapsService.selectMapByName(name, mode);
    if (!map) {
      throw new NotFoundException('Map not found');
    }

    return {
      map,
      stats: await this.mapsService.selectMapStats(map.mapID, type, grade, 5)
    };
  }
}
