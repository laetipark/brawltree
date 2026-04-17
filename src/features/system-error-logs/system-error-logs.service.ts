import { Injectable, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';

import {
  LogFields,
  SystemErrorLogPayload,
  parsePositiveInt,
  redactLogValue,
  registerSystemErrorLogSink,
  truncateLogValue
} from '~/utils/logging';
import { ResolveSystemErrorLogDto, SystemErrorLogQueryDto } from './dto/system-error-log-query.dto';
import { SystemErrorLog } from './system-error-log.entity';

type PageOptions = {
  page: number;
  limit: number;
};

@Injectable()
export class SystemErrorLogsService implements OnModuleInit, OnModuleDestroy {
  private readonly runtimeRole = process.env.SYSTEM_ERROR_LOG_ROLE || 'api';

  constructor(
    @InjectRepository(SystemErrorLog)
    private readonly systemErrorLogs: Repository<SystemErrorLog>
  ) {}

  onModuleInit(): void {
    registerSystemErrorLogSink((payload) => this.record(payload));
  }

  onModuleDestroy(): void {
    registerSystemErrorLogSink(undefined);
  }

  async record(payload: SystemErrorLogPayload): Promise<void> {
    const fields = payload.fields || {};

    await this.systemErrorLogs.insert({
      occurredAt: payload.occurredAt,
      source: 'service',
      runtimeRole: this.toNullableString(fields.role) || this.runtimeRole,
      level: payload.level,
      event: this.toNullableString(fields.event),
      status: this.toNullableString(fields.status),
      method: this.toNullableString(fields.method),
      path: this.toNullableString(fields.path),
      target: this.toNullableString(fields.target),
      errorMessage: this.toNullableString(payload.errorMessage ?? fields.error, 1000),
      errorCode: this.toNullableString(payload.errorCode ?? fields.code, 100),
      errorStack: this.toNullableString(payload.errorStack, 8000),
      contextKey: this.toNullableString(payload.contextKey ?? fields.previous, 150),
      runId: this.toNullableString(fields.runId, 80),
      requestId: this.toNullableString(fields.requestId, 80),
      instanceId: this.toNullableString(fields.instanceId, 40),
      job: this.toNullableString(fields.job, 80),
      durationMs: this.toNullableNumber(fields.durationMs),
      metadata: this.toMetadata(fields),
      resolvedAt: null,
      resolvedNote: null
    });
  }

  async findLogs(query: SystemErrorLogQueryDto = {}) {
    const { page, limit } = this.getPageOptions(query);
    const builder = this.systemErrorLogs
      .createQueryBuilder('log')
      .select([
        'log.id',
        'log.occurredAt',
        'log.source',
        'log.runtimeRole',
        'log.level',
        'log.event',
        'log.status',
        'log.method',
        'log.path',
        'log.target',
        'log.errorMessage',
        'log.errorCode',
        'log.contextKey',
        'log.runId',
        'log.requestId',
        'log.instanceId',
        'log.job',
        'log.durationMs',
        'log.resolvedAt',
        'log.resolvedNote',
        'log.createdAt'
      ])
      .orderBy('log.occurredAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    this.applyFilters(builder, query);

    const [items, total] = await builder.getManyAndCount();
    return { items, page, limit, total };
  }

  async findLog(id: string): Promise<SystemErrorLog> {
    const log = await this.systemErrorLogs.findOne({ where: { id } });
    if (!log) {
      throw new NotFoundException(`SYSTEM_ERROR_LOG_NOT_FOUND: ${id}`);
    }

    return log;
  }

  async resolveLog(id: string, body: ResolveSystemErrorLogDto = {}): Promise<SystemErrorLog> {
    const log = await this.findLog(id);
    log.resolvedAt = new Date();
    log.resolvedNote = this.toNullableString(body.note, 1000);
    await this.systemErrorLogs.save(log);
    return log;
  }

  private applyFilters(builder: SelectQueryBuilder<SystemErrorLog>, query: SystemErrorLogQueryDto): void {
    if (query.source) {
      builder.andWhere('log.source = :source', { source: query.source });
    }
    if (query.event) {
      builder.andWhere('log.event = :event', { event: query.event });
    }
    if (query.status) {
      builder.andWhere('log.status = :status', { status: query.status });
    }
    if (query.resolved === 'true') {
      builder.andWhere('log.resolvedAt IS NOT NULL');
    }
    if (query.resolved === 'false') {
      builder.andWhere('log.resolvedAt IS NULL');
    }

    const from = this.toDate(query.from);
    if (from) {
      builder.andWhere('log.occurredAt >= :from', { from });
    }

    const to = this.toDate(query.to);
    if (to) {
      builder.andWhere('log.occurredAt <= :to', { to });
    }
  }

  private getPageOptions(query: SystemErrorLogQueryDto): PageOptions {
    const page = parsePositiveInt(query.page, 1);
    const limit = Math.min(parsePositiveInt(query.limit, 50), 200);
    return { page, limit };
  }

  private toDate(value: string | undefined): Date | null {
    if (!value) {
      return null;
    }

    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }

  private toNullableString(value: unknown, maxLength = 500): string | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }

    return truncateLogValue(redactLogValue('', value), maxLength);
  }

  private toNullableNumber(value: unknown): number | null {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
  }

  private toMetadata(fields: LogFields): Record<string, unknown> | null {
    const metadata = Object.fromEntries(
      Object.entries(redactLogValue('metadata', fields) as Record<string, unknown>).filter(
        ([, value]) => value !== undefined && value !== null && value !== ''
      )
    );

    return Object.keys(metadata).length ? metadata : null;
  }
}
