import { Logger } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { UsersService } from './users.service';

describe('UsersService', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  it('returns an empty list without querying when user IDs are empty', async () => {
    const repository = {
      createQueryBuilder: jest.fn()
    };
    const service = new UsersService(repository as never, {} as never);

    await expect(service.selectUsersByUserIDs()).resolves.toEqual([]);
    await expect(service.selectUsersByUserIDs([''])).resolves.toEqual([]);
    expect(repository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('marks crawler refresh as unavailable for connection refused errors and logs a sanitized message', async () => {
    const builder = {
      select: jest.fn(),
      addSelect: jest.fn(),
      innerJoin: jest.fn(),
      where: jest.fn(),
      limit: jest.fn(),
      getRawOne: jest.fn()
    };

    builder.select.mockReturnValue(builder);
    builder.addSelect.mockReturnValue(builder);
    builder.innerJoin.mockReturnValue(builder);
    builder.where.mockReturnValue(builder);
    builder.limit.mockReturnValue(builder);
    builder.getRawOne.mockResolvedValue(null);

    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(builder)
    };
    const httpService = {
      post: jest.fn().mockReturnValue(
        throwError(() => ({
          isAxiosError: true,
          code: 'ECONNREFUSED',
          config: {
            baseURL: 'http://172.30.1.7:1453'
          }
        }))
      ),
      patch: jest.fn()
    };
    const loggerSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);
    const service = new UsersService(repository as never, httpService as never);

    await expect(service.updateUserFromCrawler(null, '2LJLP2UVQ0')).resolves.toEqual({
      insert: false,
      update: false,
      unavailable: true
    });
    expect(loggerSpy.mock.calls[0][0]).toContain(
      'event=crawler.refresh.error'
    );
    expect(loggerSpy.mock.calls[0][0]).toContain('target=2LJLP2UVQ0');
    expect(loggerSpy.mock.calls[0][0]).toContain('unavailable=true');
    expect(loggerSpy.mock.calls[0][0]).toContain('error="code=ECONNREFUSED"');
    expect(loggerSpy.mock.calls[0][0]).toContain(
      'previous=UsersController-selectUser'
    );
    expect(loggerSpy.mock.calls[0][0]).not.toContain('172.30.1.7');
    expect(loggerSpy.mock.calls[0][2]).toBe(
      'UsersService-updateUserFromCrawler'
    );
  });

  it('skips crawler refresh for on-demand users outside the recent battle window regardless of verification', async () => {
    const httpService = {
      post: jest.fn(),
      patch: jest.fn()
    };
    const service = new UsersService({} as never, httpService as never);

    await expect(
      service.updateUserFromCrawler(
        {
          userID: '#ONDEMAND',
          lastBattledOn: new Date(Date.now() - 4 * 60 * 1000),
          crew: null,
          crewName: null,
          isCrew: false,
          isVerified: false,
          updatedAt: new Date(Date.now() - 20 * 60 * 1000),
          userName: 'On Demand',
          profileIcon: '28000000'
        } as never,
        'ONDEMAND'
      )
    ).resolves.toEqual({
      insert: false,
      update: false,
      unavailable: false
    });

    expect(httpService.patch).not.toHaveBeenCalled();
  });

  it('refreshes recent on-demand users through the crawler patch route', async () => {
    const httpService = {
      post: jest.fn(),
      patch: jest.fn().mockReturnValue(of({ status: 200 }))
    };
    const service = new UsersService({} as never, httpService as never);

    await expect(
      service.updateUserFromCrawler(
        {
          userID: '#ONDEMAND',
          lastBattledOn: new Date(Date.now() - 30 * 1000),
          crew: null,
          crewName: null,
          isCrew: false,
          isVerified: false,
          updatedAt: new Date(),
          userName: 'On Demand',
          profileIcon: '28000000'
        } as never,
        'ONDEMAND'
      )
    ).resolves.toEqual({
      insert: false,
      update: true,
      unavailable: false
    });

    expect(httpService.patch).toHaveBeenCalledWith('brawlian/ONDEMAND');
  });
});
