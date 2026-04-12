import {
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseIntPipe,
  Query
} from '@nestjs/common';
import { UsersService } from './services/users.service';
import { UserProfileService } from './services/user-profile.service';
import { UserBattlesService } from './services/user-battles.service';
import { UserBrawlersService } from './services/user-brawlers.service';
import { FailureResponseEnum } from '~/common/enums/failure-response.enum';
import { SelectUserDto } from './dto/select-users.dto';

@Controller('brawlian')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userProfileService: UserProfileService,
    private readonly userBattlesService: UserBattlesService,
    private readonly userBrawlersService: UserBrawlersService
  ) {}

  @Get('/keyword')
  @HttpCode(200)
  selectUsersByNickname(@Query('keyword') keyword: string) {
    return this.usersService.selectUsersByKeyword(keyword);
  }

  @Get('/ids')
  @HttpCode(200)
  selectUsersByUserIDs(@Query('userIDs') userIDs: string[]) {
    return this.usersService.selectUsersByUserIDs(userIDs);
  }

  @Get('/:id')
  @HttpCode(200)
  async selectUser(@Param('id') id: string) {
    const user = await this.usersService.selectUser(id);
    const { insert, update } = await this.usersService.updateUserFromCrawler(
      user,
      id
    );

    if (!user && !insert && !update) {
      throw new NotFoundException(
        `${FailureResponseEnum.USER_NOT_FOUND}: ${id}`
      );
    }

    return {
      user: await this.getUserOrThrow(id)
    };
  }

  @Get('/:id/profile')
  @HttpCode(200)
  async selectUserProfile(@Param('id') id: string) {
    await this.getUserOrThrow(id);

    return {
      profile: await this.userProfileService.selectUserProfile(id)
    };
  }

  @Get('/:id/brawler/:brawler')
  async selectUserBrawler(
    @Param('id') _id: string,
    @Param('brawler') _brawlerID: string
  ) {
    return;
  }

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

  private async getUserOrThrow(id: string): Promise<SelectUserDto> {
    const user = await this.usersService.selectUser(id);
    if (!user) {
      throw new NotFoundException(
        `${FailureResponseEnum.USER_NOT_FOUND}: ${id}`
      );
    }

    return user;
  }
}
