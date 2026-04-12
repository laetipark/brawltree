export type EventsType = {
  id?: number;
  mapID: string;
  mapName: string;
  mode: string;
  startTime?: Date | string;
  endTime?: Date | string;
  modifiers?: string | null;
};

export type RotationModes = {
  mode: string;
};
