import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { isAxiosError } from 'axios';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { Users } from '~/users/entities/users.entity';
import { SelectUserDto, SelectUsersDto } from '~/users/dto/select-users.dto';
import {
  createMethodLogKey,
  logErrorWithContext
} from '~/utils/logging';

type UserCrawlerRefreshResult = {
  insert: boolean;
  update: boolean;
  unavailable: boolean;
};

/**
 * 사용자 검색/조회와 crawler 온디맨드 갱신 요청을 담당합니다.
 *
 * API 컨트롤러가 직접 crawler 상태를 해석하지 않도록 사용자 응답 조회와
 * crawler 장애 판정, 갱신 필요 조건을 이 서비스에 모읍니다.
 */
@Injectable()
export class UsersService {
  /**
   * 사용자 조회 중 crawler 동기화 실패 원인을 서버 로그에 남기는 로거입니다.
   */
  private readonly logger = new Logger(UsersService.name);

  /**
   * 비크루 온디맨드 사용자를 즉시 재조회할 최근 배틀 허용 시간입니다.
   */
  private readonly onDemandRefreshWindowMs = 3 * 60 * 1000;

  /**
   * HTTP 응답이 없는 crawler 통신 장애를 서비스 불가로 간주할 네트워크 코드입니다.
   */
  private readonly crawlerUnavailableCodes = new Set([
    'ECONNREFUSED',
    'ECONNABORTED',
    'ECONNRESET',
    'ENOTFOUND',
    'EHOSTUNREACH',
    'ETIMEDOUT',
    'ERR_NETWORK'
  ]);

  constructor(
    @InjectRepository(Users)
    private readonly users: Repository<Users>,
    private readonly httpService: HttpService
  ) {}

  /**
   * 닉네임, 클럽명, 태그 접두어로 사용자 검색 결과를 조회합니다.
   */
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

  /**
   * 여러 사용자 태그에 해당하는 요약 정보를 한 번에 조회합니다.
   */
  async selectUsersByUserIDs(
    userIDs: string[] = []
  ): Promise<SelectUsersDto[]> {
    const ids = userIDs.filter(
      (userID): userID is string =>
        typeof userID === 'string' && userID.length > 0
    );
    if (ids.length === 0) {
      return [];
    }

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
        ids
      })
      .getRawMany();
  }

  /**
   * 단일 사용자 기본 정보와 프로필 아이콘을 조회합니다.
   */
  async selectUser(id: string): Promise<SelectUserDto | null> {
    return this.users
      .createQueryBuilder('user')
      .select('user.id', 'userID')
      .addSelect('user.lastBattledOn', 'lastBattledOn')
      .addSelect('user.crew', 'crew')
      .addSelect('user.crewName', 'crewName')
      .addSelect('CASE WHEN user.crew IS NULL THEN 0 ELSE 1 END', 'isCrew')
      .addSelect('user.isVerified', 'isVerified')
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

  /**
   * 사용자 조회 시점에 crawler 등록/갱신이 필요한지 판단하고 요청합니다.
   */
  async updateUserFromCrawler(
    user: SelectUserDto | null,
    id: string
  ): Promise<UserCrawlerRefreshResult> {
    const responseState: UserCrawlerRefreshResult = {
      insert: false,
      update: false,
      unavailable: false
    };

    try {
      if (!user) {
        // API에 없는 사용자는 먼저 crawler에 온디맨드 등록을 요청한다.
        const response = await firstValueFrom(
          this.httpService.post(`brawlian/${id}`)
        );
        if (response.status === 201) {
          responseState.insert = true;
        }
      }

      const shouldRefreshCrewUser = this.shouldRefreshCrewUser(user);
      const shouldRefreshOnDemandUser = this.shouldRefreshOnDemandUser(user);

      if (
        responseState.insert ||
        shouldRefreshCrewUser ||
        shouldRefreshOnDemandUser
      ) {
        // 등록 직후이거나 stale 조건을 만족하면 crawler가 최신 프로필/배틀을 채우도록 갱신을 요청한다.
        const response = await firstValueFrom(
          this.httpService.patch(`brawlian/${id}`)
        );
        if (response.status === 200) {
          responseState.update = true;
        }
      }
    } catch (error) {
      responseState.unavailable = this.isCrawlerUnavailable(error);
      logErrorWithContext(
        this.logger,
        error,
        createMethodLogKey(UsersService.name, 'updateUserFromCrawler'),
        {
          event: 'crawler.refresh.error',
          target: id,
          unavailable: responseState.unavailable,
          error: this.describeCrawlerError(error)
        },
        { previous: createMethodLogKey('UsersController', 'selectUser') }
      );
    }

    return responseState;
  }

  /**
   * crawler 호출 실패가 사용자에게 서비스 불가로 전달될 장애인지 판단합니다.
   */
  private isCrawlerUnavailable(error: unknown): boolean {
    if (!isAxiosError(error)) {
      return false;
    }

    if (error.response?.status !== undefined) {
      return error.response.status >= 500;
    }

    return this.crawlerUnavailableCodes.has(error.code || '');
  }

  /**
   * crawler 오류를 안전한 로그용 문자열로 축약합니다.
   */
  private describeCrawlerError(error: unknown): string {
    if (isAxiosError(error)) {
      if (error.response?.status !== undefined) {
        return `status=${error.response.status}`;
      }

      if (error.code) {
        return `code=${error.code}`;
      }

      return 'axios_request_failed';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'unknown_error';
  }

  /**
   * 크루 사용자가 짧은 갱신 주기를 지났거나 초기 커서 상태인지 확인합니다.
   */
  private shouldRefreshCrewUser(user: SelectUserDto | null): boolean {
    if (!user?.isCrew) {
      return false;
    }

    const nextAllowedUpdateAt =
      new Date(user.updatedAt).getTime() + 2 * 60 * 1000;
    return (
      nextAllowedUpdateAt < Date.now() ||
      this.hasBootstrapBattleCursor(user.lastBattledOn)
    );
  }

  /**
   * 비크루 온디맨드 사용자가 최근 전투 동기화 창 안에 있는지 확인합니다.
   */
  private shouldRefreshOnDemandUser(user: SelectUserDto | null): boolean {
    if (!user || user.isCrew) {
      return false;
    }

    return (
      this.hasBootstrapBattleCursor(user.lastBattledOn) ||
      this.hasRecentBattleWindow(user.lastBattledOn)
    );
  }

  /**
   * 과거 부트스트랩 값으로 남은 배틀 커서인지 확인합니다.
   */
  private hasBootstrapBattleCursor(lastBattledOn: Date | string): boolean {
    return new Date(lastBattledOn).getTime() < 1001;
  }

  /**
   * 비크루 사용자의 최근 전투 갱신 허용 창에 들어오는지 확인합니다.
   */
  private hasRecentBattleWindow(lastBattledOn: Date | string): boolean {
    const battleTime = new Date(lastBattledOn).getTime();

    if (!Number.isFinite(battleTime) || battleTime < 1001) {
      return true;
    }

    return Date.now() - battleTime <= this.onDemandRefreshWindowMs;
  }
}
