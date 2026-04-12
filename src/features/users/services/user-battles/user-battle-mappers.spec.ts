import {
  buildDailyBrawlerGroups,
  buildRecentBattleCollections,
  mergeBattleLogsWithRecentBattles
} from './user-battle-mappers';
import {
  SelectRecentUserBattlesDto,
  SelectUserBattlesDto
} from '~/users/dto/select-user-battles.dto';

const baseRecentBattle: SelectRecentUserBattlesDto = {
  battleTime: '2026-04-12T10:00:00.000Z',
  duration: 90,
  brawlerID: '16000000',
  gameResult: -1,
  mapID: '15000000',
  isStarPlayer: true,
  mode: 'gemGrab',
  mapName: 'Hard Rock Mine',
  brawlerName: 'Shelly',
  role: 'Damage Dealer'
};

describe('user battle mappers', () => {
  it('groups daily brawler stats with pick and victory rates', () => {
    expect(
      buildDailyBrawlerGroups([
        {
          brawlerID: '16000000',
          brawlerName: 'Shelly',
          date: '2026-04-12',
          matchCount: '2',
          victoriesCount: '1',
          defeatsCount: '1',
          dailyTotalCount: '4'
        }
      ])
    ).toEqual([
      {
        date: '2026-04-12',
        brawlers: [
          {
            brawlerID: '16000000',
            brawlerName: 'Shelly',
            matchCount: 2,
            pickRate: 50,
            victoryRate: 50
          }
        ]
      }
    ]);
  });

  it('builds stable recent battle summaries and merges battle info keys', () => {
    const recentBattles = [
      baseRecentBattle,
      {
        ...baseRecentBattle,
        battleTime: '2026-04-12T10:05:00.000Z',
        gameResult: 1
      }
    ];
    const { recentBattlesByBattleTime, userBrawlerBattles } =
      buildRecentBattleCollections(recentBattles);
    const rawLogs: SelectUserBattlesDto[] = [
      {
        battleInfo: {
          userID: '#PLAYER',
          battleTime: baseRecentBattle.battleTime,
          duration: 90,
          matchType: 0,
          modeCode: 1,
          matchGrade: 0,
          trophyChange: 8
        },
        battlePlayers: []
      }
    ];

    expect(userBrawlerBattles).toEqual([
      {
        brawlerID: '16000000',
        brawlerName: 'Shelly',
        resultCount: {
          '-1': 1,
          '0': 0,
          '1': 1
        },
        matchCount: 2
      }
    ]);
    expect(mergeBattleLogsWithRecentBattles(rawLogs, recentBattlesByBattleTime)).toEqual([
      {
        battleInfo: {
          ...rawLogs[0].battleInfo,
          ...baseRecentBattle
        },
        battlePlayers: []
      }
    ]);
  });
});
