import { Logger as NestLogger } from '@nestjs/common';
import { Logger as TypeOrmLogger, QueryRunner } from 'typeorm';

import {
  createMethodLogKey,
  formatLogFields,
  getErrorCode,
  getErrorMessage,
  logErrorWithContext,
  normalizeSqlForLog,
  parseBoolean,
  parseLogMode,
  parsePositiveInt
} from './logging.util';

export class ServiceTypeOrmLogger implements TypeOrmLogger {
  private readonly logger = new NestLogger('TypeORM');

  logQuery(
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner
  ): void {
    if (this.getMode() !== 'all') {
      return;
    }

    this.logger.log(
      formatLogFields({
        event: 'sql.query',
        sql: normalizeSqlForLog(query),
        params: this.getParamsForLog(parameters)
      })
    );
  }

  logQueryError(
    error: string | Error,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner
  ): void {
    if (this.getMode() === 'off') {
      return;
    }

    logErrorWithContext(
      this.logger,
      error,
      createMethodLogKey(ServiceTypeOrmLogger.name, 'logQueryError'),
      {
        event: 'sql.error',
        status: 'error',
        error: getErrorMessage(error),
        code: getErrorCode(error),
        sql: normalizeSqlForLog(query),
        params: this.getParamsForLog(parameters)
      }
    );
  }

  logQuerySlow(
    time: number,
    query: string,
    parameters?: unknown[],
    _queryRunner?: QueryRunner
  ): void {
    if (this.getMode() === 'off') {
      return;
    }

    this.logger.warn(
      formatLogFields({
        event: 'sql.slow',
        status: 'slow',
        durationMs: time,
        thresholdMs: getSqlSlowMs(),
        sql: normalizeSqlForLog(query),
        params: this.getParamsForLog(parameters)
      })
    );
  }

  logSchemaBuild(message: string, _queryRunner?: QueryRunner): void {
    if (this.getMode() !== 'all') {
      return;
    }

    this.logger.log(formatLogFields({ event: 'sql.schema', message }));
  }

  logMigration(message: string, _queryRunner?: QueryRunner): void {
    if (this.getMode() === 'off') {
      return;
    }

    this.logger.log(formatLogFields({ event: 'sql.migration', message }));
  }

  log(
    level: 'log' | 'info' | 'warn',
    message: unknown,
    _queryRunner?: QueryRunner
  ): void {
    if (this.getMode() === 'off') {
      return;
    }

    if (level === 'warn') {
      this.logger.warn(formatLogFields({ event: 'sql.warn', message }));
      return;
    }

    if (this.getMode() === 'all') {
      this.logger.log(formatLogFields({ event: 'sql.log', level, message }));
    }
  }

  private getMode() {
    return parseLogMode(process.env.SERVICE_SQL_LOG_MODE, 'error-slow');
  }

  private getParamsForLog(parameters?: unknown[]): unknown {
    if (!parseBoolean(process.env.SERVICE_LOG_SQL_PARAMS, false)) {
      return undefined;
    }

    return parameters || [];
  }
}

export function createServiceTypeOrmLogger(): ServiceTypeOrmLogger {
  return new ServiceTypeOrmLogger();
}

export function getSqlSlowMs(): number {
  return parsePositiveInt(process.env.SERVICE_SQL_SLOW_MS, 3000);
}
