import { Entity, Index } from 'typeorm';
import { UserBattleBaseEntity } from '~/users/entities/user-battle-base.entity';

@Entity({ name: 'user_battles_ranked' })
@Index(['userID', 'playerID', 'brawlerID', 'battleTime'], { unique: true })
@Index(['userID', 'playerID', 'matchType', 'battleTime'])
@Index(['userID', 'playerID', 'brawlerID', 'battleTime', 'matchType'])
export class UserBattlesRanked extends UserBattleBaseEntity {}
