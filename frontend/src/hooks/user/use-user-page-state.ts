import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { SeasonType } from '~/common/types/season.type';
import {
  UserBattlesType,
  UserBrawlerGraphType,
  UserBrawlerItemsType,
  UserDailyBattlesType,
  UserFriendListType,
  UserOwnedBrawlersType,
  UserProfileType,
  UserRecentBattlesType,
  UserRecentBrawlersType,
  UserSeasonsType,
  UserSummaryBattleSeriesType,
  UsersType,
  UserWithoutBrawlersType
} from '~/common/types/users.type';
import {
  UserBrawlersContextType,
  UserContextType,
  UserProfileContextType
} from '~/context/user.context';

export type UserPageMenu = 'profile' | 'brawlers';

export type UserBootstrapState = {
  id: string;
  user: UsersType;
  setUser: Dispatch<SetStateAction<UsersType>>;
  userPageLoaded: boolean;
  setUserPageLoaded: Dispatch<SetStateAction<boolean>>;
  userInfoLoaded: boolean;
  setUserInfoLoaded: Dispatch<SetStateAction<boolean>>;
  profileLoaded: boolean;
  setProfileLoaded: Dispatch<SetStateAction<boolean>>;
  brawlerLoaded: boolean;
  setBrawlerLoaded: Dispatch<SetStateAction<boolean>>;
  retryUserInfoCount: number;
  setRetryUserInfoCount: Dispatch<SetStateAction<number>>;
  setRetryProfileCount: Dispatch<SetStateAction<number>>;
  setRetryBrawlerCount: Dispatch<SetStateAction<number>>;
  setBattlesLoaded: Dispatch<SetStateAction<boolean>>;
};

export const createEmptyUser = (id: string): UsersType => ({
  userID: id ? `#${id}` : '',
  userName: '',
  profileIcon: '',
  lastBattledOn: new Date(0),
  crew: null,
  crewName: null,
  isCrew: false,
  isVerified: false,
  updatedAt: new Date(0)
});

const createEmptyProfile = (): UserProfileType => ({
  userID: '',
  name: '',
  profileIcon: '',
  clubID: '',
  clubName: '',
  brawlerRank50: 0,
  currentSoloRanked: 0,
  highestSoloRanked: 0,
  currentTrophies: 0,
  highestTrophies: 0,
  trophyChange: 0,
  soloMatchVictories: 0,
  duoMatchVictories: 0,
  trioMatchVictories: 0
});

const createEmptyFriendList = (): UserFriendListType => ({
  friends: [],
  friendsUpdatedAt: undefined
});

const createEmptySeason = (): SeasonType => ({
  beginDate: undefined,
  endDate: undefined
});

export const useUserPageState = (routeId: string | undefined) => {
  const id = routeId || '';
  const [user, setUser] = useState<UsersType>(() => createEmptyUser(id));
  const [userPageLoaded, setUserPageLoaded] = useState(false);
  const [userInfoLoaded, setUserInfoLoaded] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [brawlerLoaded, setBrawlerLoaded] = useState(false);
  const [battlesLoaded, setBattlesLoaded] = useState(false);
  const [retryUserInfoCount, setRetryUserInfoCount] = useState(0);
  const [retryProfileCount, setRetryProfileCount] = useState(0);
  const [retryBrawlerCount, setRetryBrawlerCount] = useState(0);

  const [profile, setProfile] = useState<UserProfileType>(createEmptyProfile);
  const [type, setType] = useState('7');
  const [mode, setMode] = useState('all');
  const [modeTL, setModeTL] = useState<string[]>([]);
  const [modePL, setModePL] = useState<string[]>([]);
  const [summaryBattles, setSummaryBattles] = useState<UserSummaryBattleSeriesType[]>([]);
  const [dailyBrawlers, setDailyBrawlers] = useState<UserDailyBattlesType[]>([]);
  const [recentBattles, setRecentBattles] = useState<UserRecentBattlesType[]>([]);
  const [recentBrawlers, setRecentBrawlers] = useState<UserRecentBrawlersType[]>([]);
  const [battles, setBattles] = useState<UserBattlesType[]>([]);
  const [currentSeason, setCurrentSeason] = useState<SeasonType>(createEmptySeason);
  const [battleStack, setBattleStack] = useState(1);
  const [isCrew, setIsCrew] = useState(false);
  const [friendList, setFriendList] = useState<UserFriendListType>(createEmptyFriendList);
  const [seasonList, setSeasonList] = useState<UserSeasonsType[]>([]);

  const [userWithoutBrawlers, setUserWithoutBrawlers] = useState<UserWithoutBrawlersType[]>([]);
  const [userOwnedBrawlers, setUserOwnedBrawlers] = useState<UserOwnedBrawlersType[]>([]);
  const [brawlerItems, setBrawlerItems] = useState<UserBrawlerItemsType[]>([]);
  const [brawlerGraphs, setBrawlerGraphs] = useState<UserBrawlerGraphType[]>([]);
  const [menu, setMenu] = useState<UserPageMenu>('profile');

  const bootstrapState = useMemo<UserBootstrapState>(
    () => ({
      id,
      user,
      setUser,
      userPageLoaded,
      setUserPageLoaded,
      userInfoLoaded,
      setUserInfoLoaded,
      profileLoaded,
      setProfileLoaded,
      brawlerLoaded,
      setBrawlerLoaded,
      retryUserInfoCount,
      setRetryUserInfoCount,
      setRetryProfileCount,
      setRetryBrawlerCount,
      setBattlesLoaded
    }),
    [id, user, userPageLoaded, userInfoLoaded, profileLoaded, brawlerLoaded, retryUserInfoCount]
  );

  const userContextValue = useMemo<UserContextType>(
    () => ({
      id,
      user,
      setUser,
      retryProfileCount,
      retryBrawlerCount,
      userInfoLoaded,
      profileLoaded,
      brawlerLoaded,
      battlesLoaded,
      setUserPageLoaded,
      setProfileLoaded,
      setBrawlerLoaded,
      setRetryUserInfoCount,
      setRetryProfileCount,
      setRetryBrawlerCount,
      setBattlesLoaded
    }),
    [
      id,
      user,
      retryProfileCount,
      retryBrawlerCount,
      userInfoLoaded,
      profileLoaded,
      brawlerLoaded,
      battlesLoaded
    ]
  );

  const userProfileContextValue = useMemo<UserProfileContextType>(
    () => ({
      profile,
      setProfile,
      type,
      mode,
      setType,
      setMode,
      modeTL,
      modePL,
      setModeTL,
      setModePL,
      summaryBattles,
      dailyBrawlers,
      recentBattles,
      recentBrawlers,
      battles,
      currentSeason,
      battleStack,
      setSummaryBattles,
      setDailyBrawlers,
      setRecentBattles,
      setRecentBrawlers,
      setBattles,
      setCurrentSeason,
      setBattleStack,
      isCrew,
      setIsCrew,
      friendList,
      seasonList,
      setFriendList,
      setSeasonList
    }),
    [
      profile,
      type,
      mode,
      modeTL,
      modePL,
      summaryBattles,
      dailyBrawlers,
      recentBattles,
      recentBrawlers,
      battles,
      currentSeason,
      battleStack,
      isCrew,
      friendList,
      seasonList
    ]
  );

  const userBrawlersContextValue = useMemo<UserBrawlersContextType>(
    () => ({
      userWithoutBrawlers,
      setUserWithoutBrawlers,
      userOwnedBrawlers,
      setUserOwnedBrawlers,
      brawlerItems,
      setBrawlerItems,
      brawlerGraphs,
      setBrawlerGraphs
    }),
    [userWithoutBrawlers, userOwnedBrawlers, brawlerItems, brawlerGraphs]
  );

  return {
    bootstrapState,
    userContextValue,
    userProfileContextValue,
    userBrawlersContextValue,
    menu,
    setMenu,
    userInfoLoaded,
    user
  };
};
