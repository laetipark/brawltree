import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { BaseEntity } from '~/database/entities/base.entity';
import { GameEvents } from '~/maps/entities/events.entity';
import { UserBrawlerBattles } from '~/users/entities/user-brawlers.entity';
import { GameMapRotation } from '~/maps/entities/map-rotation.entity';

@Entity({ name: 'game_maps' })
export class GameMaps extends BaseEntity {
  @PrimaryColumn({
    length: 8
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 20
  })
  mode: string;

  @Column({
    type: 'varchar',
    length: 30
  })
  name: string;

  @OneToOne(() => GameMapRotation)
  mapRotation: GameMapRotation;

  @OneToMany(() => UserBrawlerBattles, (userBrawlerBattle) => userBrawlerBattle.map)
  userBrawlerBattles: UserBrawlerBattles[];

  @OneToMany(() => GameEvents, (event) => event.map)
  events: GameEvents[];
}
