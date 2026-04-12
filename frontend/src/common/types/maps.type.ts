export type RotationType = {
  id?: number;
  startTime?: Date | string;
  endTime?: Date | string;
  mapID: string;
  mapName: string;
  mode: string;
  modifiers?: string | null;
};

export type MapSummaryType = {
  mapID: string;
  mapName: string;
  mode: string;
};

export type MapSummaryResponseType = {
  maps: Record<string, MapSummaryType[]>;
};

export type MapInfoType = {
  mapID: string;
  mapName: string;
  mode: string;
  isTrophyLeague: boolean;
  isPowerLeague: boolean;
};
