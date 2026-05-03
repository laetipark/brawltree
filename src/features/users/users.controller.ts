import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query,
  ServiceUnavailableException
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserProfileService } from './services/user-profile.service';
import { UserBattlesService } from './services/user-battles.service';
import { UserBrawlersService } from './services/user-brawlers.service';
import { FailureResponseEnum } from '~/common/enums/failure-response.enum';
import { SelectUserDto } from './dto/select-users.dto';

type QueryArrayValue = string | string[] | undefined;
type UserIDsQuery = {
  userIDs?: QueryArrayValue;
  'userIDs[]'?: QueryArrayValue;
};

/**
 * `/brawlian` 사용자 API의 요청 파싱과 응답 형식 조립을 담당합니다.
 *
 * 실제 조회, crawler 갱신, 배틀 집계 로직은 각 서비스에 위임해 컨트롤러의
 * 공개 계약과 예외 변환만 얇게 유지합니다.
 */
@Controller('brawlian')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userProfileService: UserProfileService,
    private readonly userBattlesService: UserBattlesService,
    private readonly userBrawlersService: UserBrawlersService
  ) {}

  /**
   * 닉네임/태그 키워드로 사용자 검색 결과를 반환합니다.
   */
  @Get('/keyword')
  @HttpCode(200)
  selectUsersByNickname(@Query('keyword') keyword: string) {
    return this.usersService.selectUsersByKeyword(keyword);
  }

  /**
   * 여러 태그의 사용자 요약 정보를 중복 없이 반환합니다.
   */
  @Get('/ids')
  @HttpCode(200)
  selectUsersByUserIDs(@Query() query: UserIDsQuery = {}) {
    return this.usersService.selectUsersByUserIDs(
      this.getUniqueQueryUserIDs(query)
    );
  }

  /**
   * 홈 내부 링크에 사용할 최근 업데이트 사용자 요약 정보를 반환합니다.
   */
  @Get('/featured')
  @HttpCode(200)
  selectFeaturedUsers(@Query('limit') limit?: string) {
    return this.usersService.selectFeaturedUsers(Number(limit));
  }

  /**
   * 사용자를 조회하고 필요하면 crawler 온디맨드 갱신을 요청합니다.
   */
  @Get('/:id')
  @HttpCode(200)
  async selectUser(@Param('id') id: string) {
    const user = await this.usersService.selectUser(id);
    const { insert, update, unavailable } =
      await this.usersService.updateUserFromCrawler(user, id);

    if (!user && unavailable) {
      throw new ServiceUnavailableException(
        `${FailureResponseEnum.CRAWLER_UNAVAILABLE}: ${id}`
      );
    }

    if (!user && !insert && !update) {
      throw new NotFoundException(
        `${FailureResponseEnum.USER_NOT_FOUND}: ${id}`
      );
    }

    return {
      user: await this.getUserOrThrow(id)
    };
  }

  /**
   * 사용자 프로필 세부 정보를 반환합니다.
   */
  @Get('/:id/profile')
  @HttpCode(200)
  async selectUserProfile(@Param('id') id: string) {
    await this.getUserOrThrow(id);

    return {
      profile: await this.userProfileService.selectUserProfile(id)
    };
  }

  /**
   * 단일 사용자-브롤러 상세 API의 예약된 라우트입니다.
   */
  @Get('/:id/brawler/:brawler')
  async selectUserBrawler(
    @Param('id') _id: string,
    @Param('brawler') _brawlerID: string
  ) {
    return;
  }

  /**
   * 사용자가 보유한 브롤러, 아이템, 그래프 데이터를 반환합니다.
   */
  @Get('/:id/brawlers')
  async selectUserBrawlers(@Param('id') id: string) {
    const {
      userWithoutBrawlers,
      userOwnedBrawlers,
      brawlerItems,
      brawlerGraphs
    } = await this.userBrawlersService.selectUserBrawlers(id);

    return {
      userWithoutBrawlers,
      userOwnedBrawlers,
      brawlerItems,
      brawlerGraphs
    };
  }

  /**
   * 사용자 배틀 통계와 선택 가능한 모드 목록을 반환합니다.
   */
  @Get('/:id/battles/stats')
  @HttpCode(200)
  async selectUserBattleStats(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('mode') mode: string
  ) {
    const { modeTL, modePL } =
      await this.userBattlesService.selectUserBattleModes(id);
    const { summaryBattles, dailyBrawlers, season } =
      await this.userBattlesService.selectUserDailyBattles(id, type, mode);

    return {
      summaryBattles,
      dailyBrawlers,
      modeTL,
      modePL,
      season
    };
  }

  /**
   * 사용자 최근 배틀 로그와 누적 브롤러 통계를 반환합니다.
   */
  @Get('/:id/battles/logs')
  @HttpCode(200)
  async selectUserBattleLogs(
    @Param('id') id: string,
    @Query('type') type: string,
    @Query('mode') mode: string,
    @Query('stack', ParseIntPipe) stack: number
  ) {
    const { recentUserBattles, userBrawlerBattles, userBattleLogs } =
      await this.userBattlesService.selectUserBattleLogs(
        id,
        type,
        mode,
        stack || 1
      );

    return {
      recentBattles: recentUserBattles,
      recentBrawlers: userBrawlerBattles,
      battles: userBattleLogs
    };
  }

  /**
   * 존재하지 않는 사용자를 공통 404 예외로 변환합니다.
   */
  private async getUserOrThrow(id: string): Promise<SelectUserDto> {
    const user = await this.usersService.selectUser(id);
    if (!user) {
      throw new NotFoundException(
        `${FailureResponseEnum.USER_NOT_FOUND}: ${id}`
      );
    }

    return user;
  }

  /**
   * axios 직렬화 방식에 따라 들어오는 두 배열 키를 하나의 태그 목록으로 합칩니다.
   */
  private getUniqueQueryUserIDs(query: UserIDsQuery): string[] {
    // `userIDs`와 `userIDs[]`를 모두 받으면 기존 프론트/브라우저 호출 방식을 동시에 유지할 수 있다.
    const userIDs = [
      ...this.normalizeQueryArray(query.userIDs),
      ...this.normalizeQueryArray(query['userIDs[]'])
    ];

    return Array.from(new Set(userIDs));
  }

  /**
   * 단일 값 또는 배열 쿼리 값을 문자열 배열로 정규화합니다.
   */
  private normalizeQueryArray(value: QueryArrayValue): string[] {
    const values = Array.isArray(value) ? value : [value];

    return values.filter(
      (item): item is string => typeof item === 'string' && item.length > 0
    );
  }
}
