import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SystemErrorLog } from './system-error-log.entity';
import { SystemErrorLogAdminGuard } from './system-error-log-admin.guard';
import { SystemErrorLogsController } from './system-error-logs.controller';
import { SystemErrorLogsService } from './system-error-logs.service';

@Module({
  imports: [TypeOrmModule.forFeature([SystemErrorLog])],
  controllers: [SystemErrorLogsController],
  providers: [SystemErrorLogAdminGuard, SystemErrorLogsService],
  exports: [SystemErrorLogsService]
})
export class SystemErrorLogsModule {}
