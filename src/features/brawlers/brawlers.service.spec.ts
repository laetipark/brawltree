import { BrawlersService } from './brawlers.service';

type QueryBuilderMock = {
  select: jest.Mock;
  addSelect: jest.Mock;
  leftJoin: jest.Mock;
  innerJoin: jest.Mock;
  where: jest.Mock;
  andWhere: jest.Mock;
  groupBy: jest.Mock;
  addGroupBy: jest.Mock;
  orderBy: jest.Mock;
  addOrderBy: jest.Mock;
  getRawMany: jest.Mock;
};

const createStatsQueryBuilder = (result: unknown[] = []): QueryBuilderMock => {
  const builder = {
    select: jest.fn(),
    addSelect: jest.fn(),
    leftJoin: jest.fn(),
    innerJoin: jest.fn(),
    where: jest.fn(),
    andWhere: jest.fn(),
    groupBy: jest.fn(),
    addGroupBy: jest.fn(),
    orderBy: jest.fn(),
    addOrderBy: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue(result)
  } as QueryBuilderMock;

  builder.select.mockReturnValue(builder);
  builder.addSelect.mockReturnValue(builder);
  builder.leftJoin.mockReturnValue(builder);
  builder.innerJoin.mockReturnValue(builder);
  builder.where.mockReturnValue(builder);
  builder.andWhere.mockReturnValue(builder);
  builder.groupBy.mockReturnValue(builder);
  builder.addGroupBy.mockReturnValue(builder);
  builder.orderBy.mockReturnValue(builder);
  builder.addOrderBy.mockReturnValue(builder);

  return builder;
};

const createModesQueryBuilder = (rows: Array<{ modeName: string }>) => {
  const builder = {
    select: jest.fn(),
    where: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue(rows)
  };

  builder.select.mockReturnValue(builder);
  builder.where.mockReturnValue(builder);

  return builder;
};

describe('BrawlersService', () => {
  it('skips the map exclusion clause when there are no excluded modes', async () => {
    const modesQueryBuilder = createModesQueryBuilder([]);
    const statsResult = [{ mapID: '1', mode: 'gemGrab' }];
    const statsQueryBuilder = createStatsQueryBuilder(statsResult);
    const service = new BrawlersService(
      {} as never,
      {} as never,
      {} as never,
      {
        createQueryBuilder: jest.fn().mockReturnValue(statsQueryBuilder)
      } as never,
      {
        createQueryBuilder: jest.fn().mockReturnValue(modesQueryBuilder)
      } as never
    );

    await expect(service.getBrawlerMaps()).resolves.toEqual(statsResult);
    expect(modesQueryBuilder.where).toHaveBeenCalledWith(
      'modes.modeType NOT IN (:...modeTypes)',
      { modeTypes: [3, 2] }
    );
    expect(statsQueryBuilder.where).toHaveBeenCalledWith(
      'bs.matchType IN (:...matchTypes)',
      { matchTypes: [0, 2] }
    );
    expect(statsQueryBuilder.andWhere).not.toHaveBeenCalled();
  });

  it('adds the map exclusion clause when excluded modes exist', async () => {
    const modesQueryBuilder = createModesQueryBuilder([
      { modeName: 'trioShowdown' },
      { modeName: 'duels' }
    ]);
    const statsQueryBuilder = createStatsQueryBuilder();
    const service = new BrawlersService(
      {} as never,
      {} as never,
      {} as never,
      {
        createQueryBuilder: jest.fn().mockReturnValue(statsQueryBuilder)
      } as never,
      {
        createQueryBuilder: jest.fn().mockReturnValue(modesQueryBuilder)
      } as never
    );

    await service.getBrawlerMaps();

    expect(statsQueryBuilder.andWhere).toHaveBeenCalledWith(
      'm.mode NOT IN (:...modes)',
      { modes: ['trioShowdown', 'duels'] }
    );
  });
});
