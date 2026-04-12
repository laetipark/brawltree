import {
  SelectRecentUserBattlesDto,
  SelectUserBattlesDto,
  SelectUserSummaryBattlesDto
} from '~/users/dto/select-user-battles.dto';
import { SeasonDto } from '~/seasons/dto/season.dto';

export type NormalizedBattleRequest = {
  type: string;
  mode: string;
  stack: number;
};

export type BattleQueryFilter = NormalizedBattleRequest & {
  matchType: number[];
  matchMode: string[];
};

export type SeasonWindowType = {
  normalSeason: SeasonDto;
  rankedSeason: SeasonDto;
  responseSeason: SeasonDto;
};

export type BattleSummaryRawRow = {
  day: string;
  value: number | string | null;
};

export type DailyBrawlerStatRawRow = {
  brawlerID: string;
  brawlerName: string;
  date: string;
  matchCount: number | string;
  victoriesCount: number | string;
  defeatsCount: number | string;
  dailyTotalCount: number | string;
};

export type DailyBrawlerSummaryType = {
  brawlerID: string;
  brawlerName: string;
  matchCount: number;
  pickRate: number;
  victoryRate: number;
};

export type DailyBrawlerGroupType = {
  date: string;
  brawlers: DailyBrawlerSummaryType[];
};

export type UserDailyBattlesResult = {
  summaryBattles: SelectUserSummaryBattlesDto[][];
  dailyBrawlers: DailyBrawlerGroupType[];
  season: SeasonDto;
};

export type UserBattleModesResult = {
  season: SeasonDto;
  modeTL: string[];
  modePL: string[];
};

export type UserBattleModeRawRow = {
  modeName: string;
};

export type RecentBattleLookup = Map<number, SelectRecentUserBattlesDto>;

export type UserBattleLogRawRow = SelectUserBattlesDto;

export type BattleResultCounterType = Record<string, number>;

export type BrawlerBattleCounterType = Record<
  string,
  {
    brawlerName: string;
    resultCount: BattleResultCounterType;
    matchCount: number;
  }
>;
