import { SelectQueryBuilder } from 'typeorm';

import { UserBattlesService } from './user-battles.service';

describe('UserBattlesService', () => {
  const createService = () =>
    new UserBattlesService(
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never,
      {} as never
    );

  it('skips the mode predicate when the resolved mode list is empty', () => {
    const service = createService();
    const queryBuilder = {
      andWhere: jest.fn()
    } as unknown as SelectQueryBuilder<any>;

    service['applyMatchModeFilter'](queryBuilder, []);

    expect(queryBuilder.andWhere).not.toHaveBeenCalled();
  });

  it('applies the mode predicate when mode values are present', () => {
    const service = createService();
    const queryBuilder = {
      andWhere: jest.fn()
    } as unknown as SelectQueryBuilder<any>;

    service['applyMatchModeFilter'](queryBuilder, ['gemGrab']);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      'map.mode IN (:...mode)',
      {
        mode: ['gemGrab']
      }
    );
  });
});
