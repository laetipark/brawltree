import { NotFoundException } from '@nestjs/common';

import { SystemErrorLogsService } from './system-error-logs.service';

const createBuilder = () => {
  const builder = {
    select: jest.fn(),
    orderBy: jest.fn(),
    skip: jest.fn(),
    take: jest.fn(),
    andWhere: jest.fn(),
    getManyAndCount: jest.fn().mockResolvedValue([[{ id: '1' }], 1])
  };

  Object.values(builder).forEach((fn) => {
    if (typeof fn === 'function' && fn !== builder.getManyAndCount) {
      (fn as jest.Mock).mockReturnValue(builder);
    }
  });

  return builder;
};

describe('SystemErrorLogsService', () => {
  it('stores normalized service error logs', async () => {
    const repository = {
      insert: jest.fn().mockResolvedValue(undefined)
    };
    const service = new SystemErrorLogsService(repository as any);

    await service.record({
      occurredAt: new Date('2026-04-18T00:00:00.000Z'),
      level: 'error',
      contextKey: 'HttpErrorLoggingInterceptor-intercept',
      errorMessage: 'boom',
      errorCode: '500',
      errorStack: 'stack',
      fields: {
        event: 'http.server.error',
        method: 'GET',
        path: '/api/test',
        status: 500,
        token: 'secret'
      }
    });

    expect(repository.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        source: 'service',
        runtimeRole: 'api',
        event: 'http.server.error',
        status: '500',
        method: 'GET',
        path: '/api/test',
        errorMessage: 'boom',
        metadata: expect.objectContaining({
          token: '[REDACTED]'
        })
      })
    );
  });

  it('applies list filters and pagination defaults', async () => {
    const builder = createBuilder();
    const repository = {
      createQueryBuilder: jest.fn().mockReturnValue(builder)
    };
    const service = new SystemErrorLogsService(repository as any);

    await expect(
      service.findLogs({
        source: 'service',
        event: 'http.server.error',
        status: '500',
        resolved: 'false',
        from: '2026-04-01T00:00:00.000Z',
        to: '2026-04-18T00:00:00.000Z',
        page: '2',
        limit: '300'
      })
    ).resolves.toEqual({ items: [{ id: '1' }], page: 2, limit: 200, total: 1 });

    expect(builder.skip).toHaveBeenCalledWith(200);
    expect(builder.take).toHaveBeenCalledWith(200);
    expect(builder.andWhere).toHaveBeenCalledWith('log.source = :source', { source: 'service' });
    expect(builder.andWhere).toHaveBeenCalledWith('log.event = :event', { event: 'http.server.error' });
    expect(builder.andWhere).toHaveBeenCalledWith('log.status = :status', { status: '500' });
    expect(builder.andWhere).toHaveBeenCalledWith('log.resolvedAt IS NULL');
    expect(builder.andWhere).toHaveBeenCalledWith('log.occurredAt >= :from', { from: expect.any(Date) });
    expect(builder.andWhere).toHaveBeenCalledWith('log.occurredAt <= :to', { to: expect.any(Date) });
  });

  it('marks an error log as resolved', async () => {
    const log = { id: '1', resolvedAt: null, resolvedNote: null };
    const repository = {
      findOne: jest.fn().mockResolvedValue(log),
      save: jest.fn().mockResolvedValue(log)
    };
    const service = new SystemErrorLogsService(repository as any);

    await expect(service.resolveLog('1', { note: 'handled' })).resolves.toBe(log);

    expect(log.resolvedAt).toBeInstanceOf(Date);
    expect(log.resolvedNote).toBe('handled');
    expect(repository.save).toHaveBeenCalledWith(log);
  });

  it('throws when a requested log does not exist', async () => {
    const service = new SystemErrorLogsService({ findOne: jest.fn().mockResolvedValue(null) } as any);

    await expect(service.findLog('404')).rejects.toBeInstanceOf(NotFoundException);
  });
});
