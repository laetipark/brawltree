import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SeasonsService } from '~/seasons/seasons.service';
import { UserProfile } from '~/users/entities/user-profile.entity';
import { UserBattlesNormal } from '~/users/entities/user-battles-normal.entity';
import { UserBattlesRanked } from '~/users/entities/user-battles-ranked.entity';
import { SelectUserProfileDto } from '~/users/dto/select-user-profile.dto';

@Injectable()
export class UserProfileService {
  constructor(
    @InjectRepository(UserProfile)
    private readonly userProfile: Repository<UserProfile>,
    @InjectRepository(UserBattlesNormal)
    private readonly userBattlesNormal: Repository<UserBattlesNormal>,
    @InjectRepository(UserBattlesRanked)
    private readonly userBattlesRanked: Repository<UserBattlesRanked>,
    private readonly seasonsService: SeasonsService
  ) {}

  /** 사용자 프로필 정보 반환
   * @param id 사용자 ID */
  async selectUserProfile(id: string): Promise<SelectUserProfileDto> {
    const season = this.seasonsService.getRecentSeason();
    const params = {
      id: `#${id}`,
      season: season.beginDate
    };
    const [normalTrophyChange, rankedTrophyChange] = await Promise.all([
      this.userBattlesNormal
        .createQueryBuilder('uBattle')
        .select('SUM(uBattle.trophyChange)', 'trophyChange')
        .where('uBattle.userID = :id AND uBattle.playerID = :id', params)
        .andWhere('uBattle.battleTime >= :season', params)
        .limit(1)
        .getRawOne(),
      this.userBattlesRanked
        .createQueryBuilder('uBattle')
        .select('SUM(uBattle.trophyChange)', 'trophyChange')
        .where('uBattle.userID = :id AND uBattle.playerID = :id', params)
        .andWhere('uBattle.battleTime >= :season', params)
        .limit(1)
        .getRawOne()
    ]);
    const trophyChange =
      Number(normalTrophyChange?.trophyChange || 0) +
      Number(rankedTrophyChange?.trophyChange || 0);

    return {
      ...(await this.userProfile.findOne({
        where: {
          userID: `#${id}`
        }
      })),
      trophyChange
    };
  }
}
