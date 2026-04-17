import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';

import { SelectUserFriendDto } from '~/crew/dto/select-user-friend.dto';
import { SelectUserSeasonDto } from '~/crew/dto/select-user-season.dto';
import { UserFriends } from '~/crew/entities/crew.entity';
import { UserBrawlerBattles } from '~/users/entities/user-brawlers.entity';
import { UserProfile } from '~/users/entities/user-profile.entity';
import { Users } from '~/users/entities/users.entity';

type CrewMemberRow = {
  userID: string;
  userName: string;
  crew: string;
  crewName: string | null;
  profileIcon: string;
  currentTrophies: number;
  currentSoloRanked: number;
  highestSoloRanked: number;
};

type MemberFriendsUpdatedAtRow = {
  friendsUpdatedAt: Date | null;
};

type SeasonModeGroup = {
  mode: string;
  items: SelectUserSeasonDto[];
  matchCount: number;
  victoriesCount: number;
  defeatsCount: number;
};

type SeasonTotal = {
  matchType: number;
  matchCount: number;
  victoriesCount: number;
  defeatsCount: number;
};

type MemberSeasonSummary = SeasonTotal & {
  victoryRate: number;
  matchList: Record<string, SeasonModeGroup>;
};

type FriendTotal = {
  friendID: string;
  friendName: string;
  profileIcon: string;
  matchCount: number;
  victoriesCount: number;
  defeatsCount: number;
  createdAt: Date;
};

type MemberFriendSummary = FriendTotal & {
  victoryRate: number;
  matchList: SelectUserFriendDto[];
};

@Injectable()
export class CrewService {
  constructor(
    @InjectRepository(Users)
    private readonly users: Repository<Users>,
    @InjectRepository(UserFriends)
    private readonly userFriends: Repository<UserFriends>,
    @InjectRepository(UserBrawlerBattles)
    private readonly uBrawlerBattles: Repository<UserBrawlerBattles>
  ) {}

  async selectMemberTable(): Promise<Record<string, CrewMemberRow[]>> {
    const members = await this.users
      .createQueryBuilder('user')
      .select('user.id', 'userID')
      .addSelect('uProfile.name', 'userName')
      .addSelect('user.crew', 'crew')
      .addSelect('user.crewName', 'crewName')
      .addSelect('uProfile.profileIcon', 'profileIcon')
      .addSelect('uProfile.currentTrophies', 'currentTrophies')
      .addSelect('uProfile.currentSoloRanked', 'currentSoloRanked')
      .addSelect('uProfile.highestSoloRanked', 'highestSoloRanked')
      .innerJoin('user.userProfile', 'uProfile')
      .where('user.crew IN ("Blossom", "Team", "Lucy")')
      .orderBy('uProfile.currentTrophies', 'DESC')
      .getRawMany<CrewMemberRow>();

    return members.reduce((result, current) => {
      result[current.crew] = result[current.crew] || [];
      result[current.crew].push(current);
      return result;
    }, {} as Record<string, CrewMemberRow[]>);
  }

  async selectMemberSeasons(id: string): Promise<MemberSeasonSummary[]> {
    const rows = await this.uBrawlerBattles
      .createQueryBuilder('uBrawlerBattles')
      .select('uBrawlerBattles.matchType', 'matchType')
      .addSelect('uBrawlerBattles.matchGrade', 'matchGrade')
      .addSelect('uBrawlerBattles.mode', 'modeName')
      .addSelect('SUM(uBrawlerBattles.matchCount)', 'matchCount')
      .addSelect('SUM(uBrawlerBattles.victoriesCount)', 'victoriesCount')
      .addSelect('SUM(uBrawlerBattles.defeatsCount)', 'defeatsCount')
      .addSelect(
        'ROUND(SUM(uBrawlerBattles.victoriesCount) * 100 / SUM(uBrawlerBattles.victoriesCount + uBrawlerBattles.defeatsCount), 2)',
        'victoryRate'
      )
      .where('uBrawlerBattles.userID = :id', {
        id: `#${id}`
      })
      .groupBy('uBrawlerBattles.matchType')
      .addGroupBy('uBrawlerBattles.matchGrade')
      .addGroupBy('uBrawlerBattles.mode')
      .getRawMany<SelectUserSeasonDto>();

    return this.groupMemberSeasons(plainToInstance(SelectUserSeasonDto, rows));
  }

  async selectMemberFriends(id: string): Promise<{
    friendList: {
      friends: MemberFriendSummary[];
      friendsUpdatedAt: Date | null;
    };
  }> {
    const rows = await this.userFriends
      .createQueryBuilder('uFriend')
      .select('uFriend.friendID', 'friendID')
      .addSelect('uFriend.matchType', 'matchType')
      .addSelect('uFriend.matchGrade', 'matchGrade')
      .addSelect('uFriend.mode', 'mode')
      .addSelect('COALESCE(user.crewName, uProfile.name)', 'friendName')
      .addSelect('uProfile.profileIcon', 'profileIcon')
      .addSelect('SUM(uFriend.matchCount)', 'matchCount')
      .addSelect('SUM(uFriend.victoriesCount)', 'victoriesCount')
      .addSelect('SUM(uFriend.defeatsCount)', 'defeatsCount')
      .addSelect(
        'ROUND(SUM(uFriend.victoriesCount) * 100 / SUM(uFriend.victoriesCount + uFriend.defeatsCount), 2)',
        'victoryRate'
      )
      .addSelect('MIN(uFriend.createdAt)', 'createdAt')
      .innerJoin(Users, 'user', 'uFriend.friendID = user.id')
      .innerJoin(UserProfile, 'uProfile', 'uFriend.friendID = uProfile.userID')
      .where('uFriend.userID = :id', {
        id: `#${id}`
      })
      .groupBy('uFriend.friendID')
      .addGroupBy('uFriend.matchType')
      .addGroupBy('uFriend.matchGrade')
      .addGroupBy('uFriend.mode')
      .addGroupBy('user.crewName')
      .addGroupBy('uProfile.name')
      .addGroupBy('uProfile.profileIcon')
      .getRawMany<SelectUserFriendDto>();

    const updatedRow = await this.userFriends
      .createQueryBuilder('uFriend')
      .select('MAX(uFriend.updatedAt)', 'friendsUpdatedAt')
      .where('uFriend.userID = :id', {
        id: `#${id}`
      })
      .getRawOne<MemberFriendsUpdatedAtRow>();

    return {
      friendList: {
        friends: this.groupMemberFriends(
          plainToInstance(SelectUserFriendDto, rows)
        ),
        friendsUpdatedAt: updatedRow?.friendsUpdatedAt ?? null
      }
    };
  }

  private groupMemberSeasons(
    seasons: SelectUserSeasonDto[]
  ): MemberSeasonSummary[] {
    const totals: Record<number, SeasonTotal> = {};
    const matchLists: Record<number, Record<string, SeasonModeGroup>> = {};

    seasons.forEach((season) => {
      const { matchType, modeName } = season;

      totals[matchType] = totals[matchType] || {
        matchType,
        matchCount: 0,
        victoriesCount: 0,
        defeatsCount: 0
      };
      totals[matchType].matchCount += season.matchCount;
      totals[matchType].victoriesCount += season.victoriesCount;
      totals[matchType].defeatsCount += season.defeatsCount;

      matchLists[matchType] = matchLists[matchType] || {};
      matchLists[matchType][modeName] = matchLists[matchType][modeName] || {
        mode: modeName,
        items: [],
        matchCount: 0,
        victoriesCount: 0,
        defeatsCount: 0
      };

      const modeGroup = matchLists[matchType][modeName];
      modeGroup.matchCount += season.matchCount;
      modeGroup.victoriesCount += season.victoriesCount;
      modeGroup.defeatsCount += season.defeatsCount;
      modeGroup.items.push(season);
    });

    return Object.keys(matchLists).map((matchType) => {
      const total = totals[Number(matchType)];

      return {
        ...total,
        victoryRate: this.calculateVictoryRate(
          total.victoriesCount,
          total.defeatsCount
        ),
        matchList: matchLists[Number(matchType)]
      };
    });
  }

  private groupMemberFriends(
    friends: SelectUserFriendDto[]
  ): MemberFriendSummary[] {
    const totals: Record<string, FriendTotal> = {};
    const matchLists: Record<string, SelectUserFriendDto[]> = {};

    friends.forEach((friend) => {
      totals[friend.friendID] = totals[friend.friendID] || {
        friendID: friend.friendID,
        friendName: friend.friendName,
        profileIcon: friend.profileIcon,
        matchCount: 0,
        victoriesCount: 0,
        defeatsCount: 0,
        createdAt: friend.createdAt
      };

      totals[friend.friendID].matchCount += friend.matchCount;
      totals[friend.friendID].victoriesCount += friend.victoriesCount;
      totals[friend.friendID].defeatsCount += friend.defeatsCount;
      matchLists[friend.friendID] = matchLists[friend.friendID] || [];
      matchLists[friend.friendID].push(friend);
    });

    return Object.keys(matchLists).map((friendID) => {
      const total = totals[friendID];

      return {
        ...total,
        victoryRate: this.calculateVictoryRate(
          total.victoriesCount,
          total.defeatsCount
        ),
        matchList: matchLists[friendID]
      };
    });
  }

  private calculateVictoryRate(victoriesCount: number, defeatsCount: number) {
    const total = victoriesCount + defeatsCount;
    return total > 0 ? (victoriesCount * 100) / total : 0;
  }
}
