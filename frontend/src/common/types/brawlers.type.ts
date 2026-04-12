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
