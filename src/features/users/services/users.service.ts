import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Users } from '~/users/entities/users.entity';
import { SelectUserDto, SelectUsersDto } from '~/users/dto/select-users.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(Users)
    private readonly users: Repository<Users>,
    private readonly httpService: HttpService
  ) {}

  async selectUsersByKeyword(keyword: string): Promise<SelectUsersDto[]> {
    return this.users
      .createQueryBuilder('user')
      .select('user.id', 'userID')
      .addSelect('uProfile.name', 'userName')
      .addSelect('uProfile.profileIcon', 'profileIcon')
      .addSelect('uProfile.clubName', 'clubName')
      .addSelect('uProfile.currentTrophies', 'currentTrophies')
      .addSelect('uProfile.currentSoloRanked', 'currentSoloRanked')
      .innerJoin('user.userProfile', 'uProfile')
      .where('uProfile.name LIKE :keyword', {
        keyword: `%${keyword}%`
      })
      .orWhere('user.crewName LIKE :crewName', {
        crewName: `%${keyword}%`
      })
      .orWhere('user.id LIKE :id', {
        id: `#${keyword}%`
      })
      .orderBy('uProfile.currentTrophies', 'DESC')
      .limit(50)
      .getRawMany();
  }

  async selectUsersByUserIDs(userIDs: string[]): Promise<SelectUsersDto[]> {
    return this.users
      .createQueryBuilder('user')
      .select('user.id', 'userID')
      .addSelect('uProfile.name', 'userName')
      .addSelect('uProfile.profileIcon', 'profileIcon')
      .addSelect('uProfile.clubName', 'clubName')
      .addSelect('uProfile.currentTrophies', 'currentTrophies')
      .addSelect('uProfile.currentSoloRanked', 'currentSoloRanked')
      .innerJoin('user.userProfile', 'uProfile')
      .where('user.id IN (:...ids)', {
        ids: userIDs
      })
      .getRawMany();
  }

  async selectUser(id: string): Promise<SelectUserDto | null> {
    return this.users
      .createQueryBuilder('user')
      .select('user.id', 'userID')
      .addSelect('user.lastBattledOn', 'lastBattledOn')
      .addSelect('user.crew', 'crew')
      .addSelect('user.crewName', 'crewName')
      .addSelect('user.isCrew', 'isCrew')
      .addSelect('user.updatedAt', 'updatedAt')
      .addSelect('uProfile.name', 'userName')
      .addSelect('uProfile.profileIcon', 'profileIcon')
      .innerJoin('user.userProfile', 'uProfile')
      .where('user.id = :id', {
        id: `#${id}`
      })
      .limit(1)
      .getRawOne();
  }

  async updateUserFromCrawler(user: SelectUserDto | null, id: string) {
    const responseState = {
      insert: false,
      update: false
    };

    try {
      if (!user) {
        const response = await firstValueFrom(this.httpService.post(`brawlian/${id}`));
        if (response.status === 201) {
          responseState.insert = true;
        }
      }

      if (
        responseState.insert ||
        (user &&
          (new Date(new Date(user.updatedAt).getTime() + 2 * 60 * 1000) <
            new Date() ||
            new Date(user.lastBattledOn).getTime() < 1001))
      ) {
        const response = await firstValueFrom(this.httpService.patch(`brawlian/${id}`));
        if (response.status === 200) {
          responseState.update = true;
        }
      }
    } catch (error) {
      Logger.error(error, 'SelectUser');
    }

    return responseState;
  }
}
