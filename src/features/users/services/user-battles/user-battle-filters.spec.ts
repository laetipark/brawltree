import {
  normalizeBattleRequest,
  resolveBattleQueryFilter
} from './user-battle-filters';

describe('user battle filters', () => {
  it('normalizes missing battle filters to stable defaults', () => {
    expect(normalizeBattleRequest(undefined, undefined, undefined)).toEqual({
      type: '0',
      mode: 'all',
      stack: 1
    });
    expect(normalizeBattleRequest('7', 'gemGrab', 0)).toEqual({
      type: '7',
      mode: 'gemGrab',
      stack: 1
    });
  });

  it('resolves all/ranked filter values before query construction', async () => {
    await expect(
      resolveBattleQueryFilter(
        {
          type: '7',
          mode: 'all',
          stack: 2
        },
        {
          getTypeList: async () => [0, 2, 3],
          selectModeList: async () => ['gemGrab', 'brawlBall']
        }
      )
    ).resolves.toEqual({
      type: '7',
      mode: 'all',
      stack: 2,
      matchType: [0, 2, 3],
      matchMode: ['gemGrab', 'brawlBall']
    });

    await expect(
      resolveBattleQueryFilter(
        {
          type: '2',
          mode: 'knockout',
          stack: 1
        },
        {
          getTypeList: async () => [0, 2, 3],
          selectModeList: async () => ['gemGrab', 'brawlBall']
        }
      )
    ).resolves.toMatchObject({
      matchType: [2, 3],
      matchMode: ['knockout']
    });
  });
});
