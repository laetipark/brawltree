import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity({ name: 'game_map_rotation' })
export class GameMapRotation {
  @PrimaryColumn({
    name: 'map_id',
    length: 8
  })
  mapID: string;

  @Column({
    name: 'is_trophy_league'
  })
  isTrophyLeague: boolean;

  @Column({
    name: 'is_power_league'
  })
  isPowerLeague: boolean;
}
