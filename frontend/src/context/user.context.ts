import { Dispatch, SetStateAction, createContext } from 'react';
import {
  UserBattlesType,
  UserBrawlerGraphType,
  UserBrawlerItemsType,
  UserOwnedBrawlersType,
  UserDailyBattlesType,
  UserFriendListType,
  UserProfileType,
  UserRecentBattlesType,
  UserRecentBrawlersType,
  UserSeasonsType,
  UserSummaryBattleSeriesType,
  UsersType,
  UserWithoutBrawlersType
} from '~/common/types/users.type';
import { SeasonType } from '~/common/types/season.type';

export type UserContextType = {
  id: string;
  user: UsersType;
  setUser: Dispatch<SetStateAction<UsersType>>;
  retryProfileCount: number;
  retryBrawlerCount: number;
  userInfoLoaded: boolean;
  profileLoaded: boolean;
  brawlerLoaded: boolean;
  battlesLoaded: boolean;
  setUserPageLoaded: Dispatch<SetStateAction<boolean>>;
  setProfileLoaded: Dispatch<SetStateAction<boolean>>;
  setBrawlerLoaded: Dispatch<SetStateAction<boolean>>;
  setRetryUserInfoCount: Dispatch<SetStateAction<number>>;
  setRetryProfileCount: Dispatch<SetStateAction<number>>;
  setRetryBrawlerCount: Dispatch<SetStateAction<number>>;
  setBattlesLoaded: Dispatch<SetStateAction<boolean>>;
};

export type UserProfileContextType = {
  profile: UserProfileType;
  setProfile: Dispatch<SetStateAction<UserProfileType>>;
  type: string;
  mode: string;
  setType: Dispatch<SetStateAction<string>>;
  setMode: Dispatch<SetStateAction<string>>;
  modeTL: string[];
  modePL: string[];
  setModeTL: Dispatch<SetStateAction<string[]>>;
  setModePL: Dispatch<SetStateAction<string[]>>;
  summaryBattles: UserSummaryBattleSeriesType[];
  dailyBrawlers: UserDailyBattlesType[];
  recentBattles: UserRecentBattlesType[];
  recentBrawlers: UserRecentBrawlersType[];
  battles: UserBattlesType[];
  currentSeason: SeasonType;
  battleStack: number;
  setSummaryBattles: Dispatch<SetStateAction<UserSummaryBattleSeriesType[]>>;
  setDailyBrawlers: Dispatch<SetStateAction<UserDailyBattlesType[]>>;
  setRecentBattles: Dispatch<SetStateAction<UserRecentBattlesType[]>>;
  setRecentBrawlers: Dispatch<SetStateAction<UserRecentBrawlersType[]>>;
  setBattles: Dispatch<SetStateAction<UserBattlesType[]>>;
  setCurrentSeason: Dispatch<SetStateAction<SeasonType>>;
  setBattleStack: Dispatch<SetStateAction<number>>;
  isCrew: boolean;
  setIsCrew: Dispatch<SetStateAction<boolean>>;
  friendList: UserFriendListType;
  seasonList: UserSeasonsType[];
  setFriendList: Dispatch<SetStateAction<UserFriendListType>>;
  setSeasonList: Dispatch<SetStateAction<UserSeasonsType[]>>;
};

export type UserBrawlersContextType = {
  userWithoutBrawlers: UserWithoutBrawlersType[];
  setUserWithoutBrawlers: Dispatch<SetStateAction<UserWithoutBrawlersType[]>>;
  userOwnedBrawlers: UserOwnedBrawlersType[];
  brawlerItems: UserBrawlerItemsType[];
  brawlerGraphs: UserBrawlerGraphType[];
  setUserOwnedBrawlers: Dispatch<SetStateAction<UserOwnedBrawlersType[]>>;
  setBrawlerItems: Dispatch<SetStateAction<UserBrawlerItemsType[]>>;
  setBrawlerGraphs: Dispatch<SetStateAction<UserBrawlerGraphType[]>>;
};

export const UserContext = createContext<UserContextType | null>(null);
export const UserProfileContext = createContext<UserProfileContextType | null>(null);
export const UserBrawlersContext = createContext<UserBrawlersContextType | null>(null);
