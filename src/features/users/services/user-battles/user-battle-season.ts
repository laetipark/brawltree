import { SeasonsService } from '~/seasons/seasons.service';
import {
  SeasonWindowType
} from './user-battle.types';
import { isRankedBattleType } from './user-battle-filters';

type SeasonServiceDependencies = Pick<
  SeasonsService,
  | 'getRecentAllBattleSeason'
  | 'getRecentNormalSeason'
  | 'getRecentRankedSeason'
>;

export const getSeasonWindow = (
  type: string,
  seasonsService: SeasonServiceDependencies
): SeasonWindowType => {
  const normalSeason = seasonsService.getRecentNormalSeason();
  const rankedSeason = seasonsService.getRecentRankedSeason();

  if (isRankedBattleType(type)) {
    return {
      normalSeason,
      rankedSeason,
      responseSeason: rankedSeason
    };
  }

  if (type === '7') {
    return {
      normalSeason,
      rankedSeason,
      responseSeason: seasonsService.getRecentAllBattleSeason()
    };
  }

  return {
    normalSeason,
    rankedSeason,
    responseSeason: normalSeason
  };
};

export const getSeasonWhereClause = (alias: string, type: string): string => {
  if (isRankedBattleType(type)) {
    return `${alias}.battleTime BETWEEN :rankedBegin AND :rankedEnd`;
  }

  if (type === '7') {
    return `((${alias}.matchType IN (2,3) AND ${alias}.battleTime BETWEEN :rankedBegin AND :rankedEnd) OR (${alias}.matchType NOT IN (2,3) AND ${alias}.battleTime BETWEEN :normalBegin AND :normalEnd))`;
  }

  return `${alias}.battleTime BETWEEN :normalBegin AND :normalEnd`;
};

export const getSeasonWhereParams = (
  seasonWindow: SeasonWindowType,
  type: string
): Record<string, Date> => {
  if (isRankedBattleType(type)) {
    return {
      rankedBegin: seasonWindow.rankedSeason.beginDate,
      rankedEnd: seasonWindow.rankedSeason.endDate
    };
  }

  if (type === '7') {
    return {
      normalBegin: seasonWindow.normalSeason.beginDate,
      normalEnd: seasonWindow.normalSeason.endDate,
      rankedBegin: seasonWindow.rankedSeason.beginDate,
      rankedEnd: seasonWindow.rankedSeason.endDate
    };
  }

  return {
    normalBegin: seasonWindow.normalSeason.beginDate,
    normalEnd: seasonWindow.normalSeason.endDate
  };
};
