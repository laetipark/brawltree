import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { UsersModule } from '~/users/users.module';
import { CrewModule } from '~/crew/crew.module';
import { MapsModule } from '~/maps/maps.module';
import { BrawlersModule } from '~/brawlers/brawlers.module';
import { UtilsModule } from '~/utils/utils.module';
import AppConfig from './configs/app.config';
import DatabaseConfig from './configs/database.config';
import { RankingsModule } from './features/rankings/rankings.module';
import { NewsModule } from './features/news/news.module';
import { SeoModule } from './features/seo/seo.module';
import { SystemErrorLogsModule } from './features/system-error-logs';
import { HttpErrorLoggingInterceptor } from '~/utils/logging';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `.${process.env.NODE_ENV}.env`,
      load: [AppConfig]
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'frontend', 'dist'),
      exclude: ['/api{/*path}', '/cdn{/*path}', '/youtube{/*path}', '/inbox{/*path}', '/brawlian{/*path}', '/en/brawlian{/*path}', '/sitemap.xml', '/sitemaps{/*path}']
    }),
    TypeOrmModule.forRootAsync({
      useClass: DatabaseConfig
    }),
    BrawlersModule,
    MapsModule,
    UsersModule,
    CrewModule,
    RankingsModule,
    NewsModule,
    SeoModule,
    SystemErrorLogsModule,
    UtilsModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: HttpErrorLoggingInterceptor
    }
  ]
})
export class AppModule {}
