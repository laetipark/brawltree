import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MapsModule } from '~/maps/maps.module';
import { SeasonsModule } from '~/seasons/seasons.module';
import { UtilsModule } from '~/utils/utils.module';
import { UsersController } from './users.controller';
import { UsersService } from './services/users.service';
import { UserProfileService } from './services/user-profile.service';
import { UserBattlesService } from './services/user-battles.service';
import { UserBrawlersService } from './services/user-brawlers.service';

import { Users } from './entities/users.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserBattlesNormal } from './entities/user-battles-normal.entity';
import { UserBattlesRanked } from './entities/user-battles-ranked.entity';
import {
  UserBrawlerBattles,
  UserBrawlerItems,
  UserBrawlers
} from './entities/user-brawlers.entity';
import { Brawlers } from '~/brawlers/entities/brawlers.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Brawlers,
      Users,
      UserProfile,
      UserBattlesNormal,
      UserBattlesRanked,
      UserBrawlers,
      UserBrawlerBattles,
      UserBrawlerItems
    ]),
    MapsModule,
    SeasonsModule,
    UtilsModule
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UserProfileService,
    UserBattlesService,
    UserBrawlersService
  ]
})
export class UsersModule {}
