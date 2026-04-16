import { Logger } from '@nestjs/common';

import { ServiceTypeOrmLogger } from './typeorm-query-logger';

describe('ServiceTypeOrmLogger', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    process.env.SERVICE_SQL_LOG_MODE = 'error-slow';
    process.env.SERVICE_SQL_SLOW_MS = '3000';
    delete process.env.SERVICE_LOG_SQL_PARAMS;
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
    delete process.env.SERVICE_SQL_LOG_MODE;
    delete process.env.SERVICE_SQL_SLOW_MS;
    delete process.env.SERVICE_LOG_SQL_PARAMS;
  });

  it('logs query errors without parameters by default', () => {
    const logger = new ServiceTypeOrmLogger();

    logger.logQueryError(
      new Error('bad query'),
      'SELECT * FROM users WHERE token = ?',
      ['secret-token']
    );

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const message = errorSpy.mock.calls[0][0];
    expect(message).toContain('event=sql.error');
    expect(message).toContain('status=error');
    expect(message).toContain('error="bad query"');
    expect(message).toContain('sql="SELECT * FROM users WHERE token = ?"');
    expect(message).not.toContain('previous=');
    expect(message).not.toContain('params=');
    expect(message).not.toContain('secret-token');
    expect(errorSpy.mock.calls[0][2]).toBe(
      'ServiceTypeOrmLogger-logQueryError'
    );
  });

  it('logs slow queries with duration and threshold', () => {
    const logger = new ServiceTypeOrmLogger();

    logger.logQuerySlow(4500, 'SELECT * FROM battles');

    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain('event=sql.slow');
    expect(warnSpy.mock.calls[0][0]).toContain('durationMs=4500');
    expect(warnSpy.mock.calls[0][0]).toContain('thresholdMs=3000');
  });

  it('logs all queries and parameters only when enabled', () => {
    process.env.SERVICE_SQL_LOG_MODE = 'all';
    process.env.SERVICE_LOG_SQL_PARAMS = 'true';
    const logger = new ServiceTypeOrmLogger();

    logger.logQuery('SELECT * FROM users WHERE id = ?', ['#USER']);

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('event=sql.query');
    expect(logSpy.mock.calls[0][0]).toContain('params=');
    expect(logSpy.mock.calls[0][0]).toContain('#USER');
  });
});
