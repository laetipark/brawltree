import { CrewService } from './crew.service';

type QueryBuilderMock = {
  select: jest.Mock;
  addSelect: jest.Mock;
  innerJoin: jest.Mock;
  where: jest.Mock;
  groupBy: jest.Mock;
  addGroupBy: jest.Mock;
  getRawMany: jest.Mock;
  getRawOne: jest.Mock;
};

const createQueryBuilder = ({
  rawMany = [],
  rawOne
}: {
  rawMany?: unknown[];
  rawOne?: unknown;
} = {}): QueryBuilderMock => {
  const builder = {
    select: jest.fn(),
    addSelect: jest.fn(),
    innerJoin: jest.fn(),
    where: jest.fn(),
    groupBy: jest.fn(),
    addGroupBy: jest.fn(),
    getRawMany: jest.fn().mockResolvedValue(rawMany),
    getRawOne: jest.fn().mockResolvedValue(rawOne)
  };

  builder.select.mockReturnValue(builder);
  builder.addSelect.mockReturnValue(builder);
  builder.innerJoin.mockReturnValue(builder);
  builder.where.mockReturnValue(builder);
  builder.groupBy.mockReturnValue(builder);
  builder.addGroupBy.mockReturnValue(builder);

  return builder;
};

describe('CrewService', () => {
  it('returns an empty friend list with a null updated date when a member has no friends', async () => {
    const friendsQueryBuilder = createQueryBuilder({ rawMany: [] });
    const updatedAtQueryBuilder = createQueryBuilder({ rawOne: undefined });
    const userFriends = {
      createQueryBuilder: jest
        .fn()
        .mockReturnValueOnce(friendsQueryBuilder)
        .mockReturnValueOnce(updatedAtQueryBuilder)
    };
    const service = new CrewService(
      {} as never,
      userFriends as never,
      {} as never
    );

    await expect(service.selectMemberFriends('YPQLR0VJP')).resolves.toEqual({
      friendList: {
        friends: [],
        friendsUpdatedAt: null
      }
    });
    expect(updatedAtQueryBuilder.groupBy).not.toHaveBeenCalled();
  });
});
