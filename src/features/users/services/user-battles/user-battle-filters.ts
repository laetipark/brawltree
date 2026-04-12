import { ModesService } from '~/maps/services/modes.service';
import { AppConfigService } from '~/utils/services/app-config.service';
import {
  BattleQueryFilter,
  NormalizedBattleRequest
} from './user-battle.types';

const DEFAULT_BATTLE_TYPE = '0';
const DEFAULT_BATTLE_MODE = 'all';
const DEFAULT_BATTLE_STACK = 1;

type BattleFilterDependencies = Pick<AppConfigService, 'getTypeList'> &
  Pick<ModesService, 'selectModeList'>;

export const normalizeBattleRequest = (
  type?: string,
  mode?: string,
  stack?: number
): NormalizedBattleRequest => {
  return {
    type: type || DEFAULT_BATTLE_TYPE,
    mode: mode || DEFAULT_BATTLE_MODE,
    stack: Math.max(DEFAULT_BATTLE_STACK, Number(stack) || DEFAULT_BATTLE_STACK)
  };
};

export const isRankedBattleType = (type: string): boolean => {
  return type === '2' || type === '3';
};

export const resolveBattleQueryFilter = async (
  request: NormalizedBattleRequest,
  dependencies: BattleFilterDependencies
): Promise<BattleQueryFilter> => {
  const matchType =
    request.type === '7'
      ? (await dependencies.getTypeList()) || []
      : isRankedBattleType(request.type)
        ? [2, 3]
        : [Number(request.type)];
  const matchMode =
    request.mode === 'all'
      ? (await dependencies.selectModeList()) || []
      : [request.mode];

  return {
    ...request,
    matchType,
    matchMode
  };
};
