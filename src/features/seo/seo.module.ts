import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Users } from '~/users/entities/users.entity';
import { SeoService } from './seo.service';

@Module({
  imports: [TypeOrmModule.forFeature([Users])],
  providers: [SeoService],
  exports: [SeoService]
})
export class SeoModule {}
