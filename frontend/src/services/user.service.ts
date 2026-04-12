import axios from 'axios';
import config from '~/common/config/config';
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
import { SeasonType } from '~/common/types/season.type';

export type CrewMembersType = {
  userID: string;
  userName: string;
  crew: string | null;
  crewName: string | null;
  profileIcon: string;
  currentTrophies: number;
  currentSoloRanked: number;
  highestSoloRanked: number;
};

type UserBrawlersResponseType = {
  userWithoutBrawlers: UserWithoutBrawlersType[];
  userOwnedBrawlers: UserOwnedBrawlersType[];
  brawlerItems: UserBrawlerItemsType[];
  brawlerGraphs: UserBrawlerGraphType[];
};

type UserBattleStatsResponseType = {
  summaryBattles: UserSummaryBattleSeriesType[];
  dailyBrawlers: UserDailyBattlesType[];
  modeTL: string[];
  modePL: string[];
  season: SeasonType;
};

type UserBattleLogsResponseType = {
  recentBattles: UserRecentBattlesType[];
  recentBrawlers: UserRecentBrawlersType[];
  battles: UserBattlesType[];
};

type CrewMemberDetailResponseType = {
  friendList: UserFriendListType;
  seasonList: UserSeasonsType[];
};

export class UserService {
  private static normalizeBattleType(type: string): string {
    if (type === 'normal') {
      return '0';
    }

    if (type === 'ranked') {
      return '2';
    }

    if (type === 'all') {
      return '7';
    }

    return type;
  }

  static getUser = ({ id }: { id: string }) =>
    axios
      .get<{ user: UsersType }>(`${config.url}/brawlian/${id}`)
      .then((result) => result.data)
      .catch((error) => {
        console.error(error);
        return null;
      });

  static getUserProfile = ({ id }: { id: string }) =>
    axios
      .get<{ profile: UserProfileType }>(`${config.url}/brawlian/${id}/profile`)
      .then((result) => result.data);

  static getUserBrawlers = ({ id }: { id: string }) =>
    axios
      .get<UserBrawlersResponseType>(`${config.url}/brawlian/${id}/brawlers`, {})
      .then((result) => result.data);

  static getUserBattleStats = ({
    id,
    type,
    mode
  }: {
    id: string;
    type: string;
    mode: string;
  }) =>
    axios
      .get<UserBattleStatsResponseType>(`${config.url}/brawlian/${id}/battles/stats`, {
        params: {
          type: UserService.normalizeBattleType(type),
          mode: mode
        }
      })
      .then((result) => result.data);

  static getUserBattleLogs = ({
    id,
    type,
    mode,
    battleStack
  }: {
    id: string;
    type: string;
    mode: string;
    battleStack: number;
  }) =>
    axios
      .get<UserBattleLogsResponseType>(`${config.url}/brawlian/${id}/battles/logs`, {
        params: {
          type: UserService.normalizeBattleType(type),
          mode: mode,
          stack: battleStack
        }
      })
      .then((result) => result.data);

  static getCrewMemberDetail = ({ id }: { id: string }) =>
    axios
      .get<CrewMemberDetailResponseType>(`${config.url}/crew/members/${id}`)
      .then((result) => result.data);

  static getCrewMembers = () =>
    axios
      .get<Record<string, CrewMembersType[]>>(`${config.url}/crew/members`)
      .then((result) => result.data);
}
