export type UsersType = {
  userID: string;
  userName: string;
  profileIcon: string;
  lastBattledOn: Date | string;
  isCrew: boolean;
  isVerified: boolean;
  crew: string | null;
  crewName: string | null;
  updatedAt: Date | string;
};

export type UserProfileType = {
  userID: string;
  name: string;
  profileIcon: string;
  clubID: string | null;
  clubName: string | null;
  currentTrophies: number;
  highestTrophies: number;
  trophyChange: number;
  trioMatchVictories: number;
  duoMatchVictories: number;
  soloMatchVictories: number;
  brawlerRank50: number;
  currentSoloRanked: number;
  highestSoloRanked: number;
};

export type UserSummaryBattlesType = {
  day: string;
  value: number;
};

export type UserSummaryBattleSeriesType = UserSummaryBattlesType[];

export type UserDailyBattlesType = {
  date: Date | string;
  brawlers: UserDailyBrawlersType[];
};

export type UserDailyBrawlersType = {
  brawlerID: string;
  matchCount: number;
  pickRate: number;
  victoryRate: number;
  brawlerName: string;
};

export type UserRecentBattlesType = {
  battleTime: string;
  duration: number;
  brawlerID: string;
  gameResult: number;
  mapID: string;
  isStarPlayer: boolean;
  mode: string;
  mapName: string;
  brawlerName: string;
  role: string;
};

export type UserRecentBrawlersType = {
  brawlerName: string;
  matchCount: number;
  resultCount: { '-1': number; '0': number; '1': number };
  brawlerID: string;
};

export type UserBattlesType = {
  battleInfo: UserBattleInfoType;
  battlePlayers: UserBattlePlayersType[];
};

export type UserBattleInfoType = {
  userID: string;
  battleTime: Date | string;
  duration: number;
  matchType: number;
  modeCode: number;
  matchGrade: number;
  trophyChange: number;
  brawlerID: string;
  gameResult: number;
  mapID: string;
  isStarPlayer: boolean;
  mode: string;
  mapName: string;
  brawlerName: string;
  role: string;
};

export type UserBattlePlayersType = {
  playerID: string;
  playerName: string;
  teamNumber: number;
  brawlerID: string;
  brawlerPower: number;
  brawlerTrophies: number;
  gameRank: number;
  gameResult: number;
  isStarPlayer: number;
};

export type UserFriendMatchType = {
  friendID: string;
  friendName: string;
  profileIcon: string;
  matchType: number;
  matchGrade: number;
  mode: string;
  matchCount: number;
  victoriesCount: number;
  defeatsCount: number;
  victoryRate: number;
  createdAt: Date | string;
};

export type UserFriendType = {
  friendID: string;
  friendName: string;
  profileIcon: string;
  matchCount: number;
  victoriesCount: number;
  defeatsCount: number;
  victoryRate: number;
  createdAt: Date | string;
  matchList: UserFriendMatchType[];
};

export type UserFriendListType = {
  friends: UserFriendType[];
  friendsUpdatedAt: Date | string | null | undefined;
};

export type UserSeasonGradeType = {
  matchType: number;
  matchGrade: number;
  modeName: string;
  matchCount: number;
  victoriesCount: number;
  defeatsCount: number;
  victoryRate: number;
};

export type UserSeasonModeType = {
  mode: string;
  items: UserSeasonGradeType[];
  matchCount: number;
  victoriesCount: number;
  defeatsCount: number;
};

export type UserSeasonsType = {
  matchType: number;
  matchCount: number;
  victoriesCount: number;
  defeatsCount: number;
  victoryRate: number;
  matchList: Record<string, UserSeasonModeType>;
};

export type UserWithoutBrawlersType = {
  brawlerID: string;
  name: string;
  rarity: string;
};

export type UserOwnedBrawlersType = {
  brawlerID: string;
  name: string;
  rarity: string;
  userID: string;
  brawlerPower: number;
  beginTrophies: number;
  currentTrophies: number;
  highestTrophies: number;
  brawlerRank: number;
  trophyPickRate: number;
  trophyVictoryRate: number;
  rankedPickRate: number;
  rankedVictoryRate: number;
  values: Record<string, unknown>;
};

export type UserBrawlerItemsType = {
  userID: string;
  brawlerID: string;
  itemID: string;
  itemKind: string;
  itemName: string;
};

export type UserBrawlerGraphType = {
  brawlerID: string;
  x: string;
  y: number;
};
