import { Body, Controller, Get, HttpCode, Param, Patch, Query, UseGuards } from '@nestjs/common';

import { ResolveSystemErrorLogDto, SystemErrorLogQueryDto } from './dto/system-error-log-query.dto';
import { SystemErrorLogAdminGuard } from './system-error-log-admin.guard';
import { SystemErrorLogsService } from './system-error-logs.service';

@Controller('system/error-logs')
@UseGuards(SystemErrorLogAdminGuard)
export class SystemErrorLogsController {
  constructor(private readonly systemErrorLogsService: SystemErrorLogsService) {}

  @Get('/')
  @HttpCode(200)
  findLogs(@Query() query: SystemErrorLogQueryDto = {}) {
    return this.systemErrorLogsService.findLogs(query);
  }

  @Get('/:id')
  @HttpCode(200)
  findLog(@Param('id') id: string) {
    return this.systemErrorLogsService.findLog(id);
  }

  @Patch('/:id/resolve')
  @HttpCode(200)
  resolveLog(
    @Param('id') id: string,
    @Body() body: ResolveSystemErrorLogDto = {}
  ) {
    return this.systemErrorLogsService.resolveLog(id, body);
  }
}
