export type BrawlerType = {
  id: string;
  name: string;
  rarity: string;
  role: string;
  gender: string;
};

export type BrawlerStatsType = {
  brawlerID: string;
  brawlerName: string;
  mapID: string;
  mapName: string;
  mode: string;
  matchType?: number | string;
  pickRate: number;
  victoryRate: number;
};

export type BrawlerSummaryItemType = {
  brawlerID: string;
  brawlerName: string;
  trophyPickRate: number;
  trophyVictoryRate: number;
  rankedPickRate: number;
  rankedVictoryRate: number;
};

export type BrawlerSummaryResponseType = {
  brawlersTrophy: BrawlerSummaryItemType[];
  brawlersRanked: BrawlerSummaryItemType[];
};
