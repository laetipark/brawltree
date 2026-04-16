import { Column, Entity, OneToMany, OneToOne, PrimaryColumn } from 'typeorm';
import { SoftDeleteEntity } from '~/database/entities/base.entity';
import { UserProfile } from '~/users/entities/user-profile.entity';
import { UserBrawlers } from './user-brawlers.entity';
import { UserFriends } from '~/crew/entities/crew.entity';

@Entity({ name: 'users' })
export class Users extends SoftDeleteEntity {
  @PrimaryColumn({
    type: 'varchar',
    length: 20
  })
  id: string;

  @Column({
    name: 'last_battled_on',
    type: 'timestamp'
  })
  lastBattledOn: Date;

  @Column({
    type: 'varchar',
    length: 20,
    nullable: true
  })
  crew: string;

  @Column({
    name: 'crew_name',
    type: 'varchar',
    length: 30,
    nullable: true
  })
  crewName: string;

  @Column({
    name: 'is_crew',
    default: false
  })
  isCrew: boolean;

  @Column({
    name: 'is_verified',
    default: false
  })
  isVerified: boolean;

  @Column({
    name: 'is_cron_item',
    default: false
  })
  isCronItem: boolean;

  @Column({
    name: 'is_cron',
    default: false
  })
  isCron: boolean;

  @OneToOne(() => UserProfile, (user) => user.user)
  userProfile: UserProfile;

  @OneToMany(() => UserBrawlers, (brawler) => brawler.user)
  userBrawlers: UserBrawlers[];

  @OneToMany(() => UserFriends, (friend) => friend.user)
  userFriends: UserFriends[];
}
