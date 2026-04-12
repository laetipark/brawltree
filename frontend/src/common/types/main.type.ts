export type SearchItemType = {
  id: number;
  userID: string;
};

export type SearchUserItemType = {
  userID: string;
  userName: string;
  profileIcon: string;
  clubName: string;
  crewName?: string;
  currentTrophies: number;
  currentSoloRanked: number;
};
