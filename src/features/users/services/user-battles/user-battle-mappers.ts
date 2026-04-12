import { plainToInstance } from 'class-transformer';
import {
  SelectRecentUserBattlesDto,
  SelectUserBattlesDto,
  SelectUserBrawlerBattlesDto,
  SelectUserSummaryBattlesDto
} from '~/users/dto/select-user-battles.dto';
import {
  BattleSummaryRawRow,
  BrawlerBattleCounterType,
  DailyBrawlerGroupType,
  DailyBrawlerStatRawRow,
  RecentBattleLookup,
  UserBattleLogRawRow,
  UserBattleModeRawRow
} from './user-battle.types';

const toBattleTimeKey = (battleTime: string | Date): number => {
  return new Date(battleTime).getTime();
};

export const buildSummaryBattles = (
  summaryRows: BattleSummaryRawRow[][]
): SelectUserSummaryBattlesDto[][] => {
  return summaryRows.map((rows) =>
    plainToInstance(SelectUserSummaryBattlesDto, rows)
  );
};

export const buildDailyBrawlerGroups = (
  dailyBrawlerStats: DailyBrawlerStatRawRow[]
): DailyBrawlerGroupType[] => {
  const groupedData = dailyBrawlerStats.reduce<Record<string, DailyBrawlerGroupType>>(
    (groups, row) => {
      const date = row.date;
      if (!groups[date]) {
        groups[date] = {
          date,
          brawlers: []
        };
      }

      const matchCount = Number(row.matchCount);
      const victoriesCount = Number(row.victoriesCount);
      const defeatsCount = Number(row.defeatsCount);
      const dailyTotalCount = Number(row.dailyTotalCount);
      const pickRate =
        dailyTotalCount > 0
          ? Number(((matchCount * 100) / dailyTotalCount).toFixed(2))
          : 0;
      const resultTotalCount = victoriesCount + defeatsCount;
      const victoryRate =
        resultTotalCount > 0
          ? Number(((victoriesCount * 100) / resultTotalCount).toFixed(2))
          : 0;

      groups[date].brawlers.push({
        brawlerID: row.brawlerID,
        brawlerName: row.brawlerName,
        matchCount,
        pickRate,
        victoryRate
      });

      return groups;
    },
    {}
  );

  return Object.values(groupedData);
};

export const buildRecentBattleCollections = (
  recentUserBattles: SelectRecentUserBattlesDto[]
): {
  recentBattlesByBattleTime: RecentBattleLookup;
  userBrawlerBattles: SelectUserBrawlerBattlesDto[];
} => {
  const recentBattlesByBattleTime = new Map<number, SelectRecentUserBattlesDto>();
  const brawlerBattleCounter = recentUserBattles.reduce<BrawlerBattleCounterType>(
    (counter, battle) => {
      const brawlerID = battle.brawlerID;
      const matchResultKey = String(battle.gameResult);

      if (!counter[brawlerID]) {
        counter[brawlerID] = {
          brawlerName: battle.brawlerName,
          resultCount: {},
          matchCount: 0
        };
      }

      const battleCounter = counter[brawlerID];
      battleCounter.resultCount[matchResultKey] =
        (battleCounter.resultCount[matchResultKey] ?? 0) + 1;
      battleCounter.matchCount += 1;

      const battleTimeKey = toBattleTimeKey(battle.battleTime);
      if (!recentBattlesByBattleTime.has(battleTimeKey)) {
        recentBattlesByBattleTime.set(battleTimeKey, battle);
      }

      return counter;
    },
    {}
  );

  const userBrawlerBattles = Object.entries(brawlerBattleCounter)
    .map<SelectUserBrawlerBattlesDto>(([brawlerID, battleCounter]) => {
      return {
        brawlerID,
        brawlerName: battleCounter.brawlerName,
        resultCount: {
          '-1': battleCounter.resultCount['-1'] ?? 0,
          '0': battleCounter.resultCount['0'] ?? 0,
          '1': battleCounter.resultCount['1'] ?? 0
        },
        matchCount: battleCounter.matchCount
      };
    })
    .sort((left, right) => right.matchCount - left.matchCount);

  return {
    recentBattlesByBattleTime,
    userBrawlerBattles
  };
};

export const mergeBattleLogsWithRecentBattles = (
  rawUserBattleLogs: UserBattleLogRawRow[],
  recentBattlesByBattleTime: RecentBattleLookup
): SelectUserBattlesDto[] => {
  return rawUserBattleLogs.map((battleLog) => {
    const battleTimeKey = toBattleTimeKey(battleLog.battleInfo.battleTime);
    const recentBattle = recentBattlesByBattleTime.get(battleTimeKey);

    return {
      battleInfo: recentBattle
        ? {
            ...battleLog.battleInfo,
            ...recentBattle
          }
        : battleLog.battleInfo,
      battlePlayers: battleLog.battlePlayers
    };
  });
};

export const prependAllMode = (results: UserBattleModeRawRow[]): string[] => {
  return ['all', ...results.map(({ modeName }) => modeName)];
};
