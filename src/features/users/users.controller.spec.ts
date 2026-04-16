import { NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { UserProfileService } from './services/user-profile.service';
import { UserBattlesService } from './services/user-battles.service';
import { UserBrawlersService } from './services/user-brawlers.service';

describe('UsersController', () => {
  const usersService = {
    selectUser: jest.fn(),
    updateUserFromCrawler: jest.fn(),
    selectUsersByKeyword: jest.fn(),
    selectUsersByUserIDs: jest.fn()
  };
  const userProfileService = {
    selectUserProfile: jest.fn()
  };
  const userBattlesService = {
    selectUserBattleModes: jest.fn(),
    selectUserDailyBattles: jest.fn(),
    selectUserBattleLogs: jest.fn()
  };
  const userBrawlersService = {
    selectUserBrawlers: jest.fn()
  };
  const controller = new UsersController(
    usersService as unknown as UsersService,
    userProfileService as unknown as UserProfileService,
    userBattlesService as unknown as UserBattlesService,
    userBrawlersService as unknown as UserBrawlersService
  );

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes bracketed user ID query params before delegating to the service', async () => {
    usersService.selectUsersByUserIDs.mockResolvedValue([]);

    await expect(
      controller.selectUsersByUserIDs({ 'userIDs[]': '#9LYJVL9C8' })
    ).resolves.toEqual([]);
    expect(usersService.selectUsersByUserIDs).toHaveBeenCalledWith([
      '#9LYJVL9C8'
    ]);
  });

  it('keeps battle log response keys stable while delegating to the service', async () => {
    userBattlesService.selectUserBattleLogs.mockResolvedValue({
      recentUserBattles: [],
      userBrawlerBattles: [],
      userBattleLogs: []
    });

    await expect(
      controller.selectUserBattleLogs('ABC123', '7', 'all', 2)
    ).resolves.toEqual({
      recentBattles: [],
      recentBrawlers: [],
      battles: []
    });
    expect(userBattlesService.selectUserBattleLogs).toHaveBeenCalledWith(
      'ABC123',
      '7',
      'all',
      2
    );
  });

  it('throws a stable not found exception when crawler refresh cannot recover the user', async () => {
    usersService.selectUser.mockResolvedValue(null);
    usersService.updateUserFromCrawler.mockResolvedValue({
      insert: false,
      update: false,
      unavailable: false
    });

    await expect(controller.selectUser('MISSING')).rejects.toBeInstanceOf(
      NotFoundException
    );
  });

  it('throws service unavailable when the user is missing and crawler is unreachable', async () => {
    usersService.selectUser.mockResolvedValue(null);
    usersService.updateUserFromCrawler.mockResolvedValue({
      insert: false,
      update: false,
      unavailable: true
    });

    await expect(controller.selectUser('MISSING')).rejects.toBeInstanceOf(
      ServiceUnavailableException
    );
  });
});
