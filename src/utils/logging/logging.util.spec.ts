import {
  createMethodLogKey,
  formatLogFields,
  logErrorWithContext,
  normalizeSqlForLog,
  normalizeUrlForLog,
  withLogContext
} from './logging.util';

describe('logging util', () => {
  it('formats key=value fields with context', () => {
    const message = withLogContext({ runId: 'run-1', role: 'api' }, () =>
      formatLogFields({
        event: 'test.event',
        status: 'ok',
        message: 'hello world'
      })
    );

    expect(message).toContain('runId=run-1');
    expect(message).toContain('role=api');
    expect(message).toContain('event=test.event');
    expect(message).toContain('message="hello world"');
  });

  it('redacts sensitive fields and truncates long values', () => {
    const message = formatLogFields(
      {
        event: 'redaction.test',
        Authorization: 'Bearer secret',
        API_KEY: 'api-secret',
        DATABASE_PASSWORD: 'db-secret',
        token: 'token-secret',
        safe: 'abcdefghijk'
      },
      { context: false, maxLength: 8 }
    );

    expect(message).toContain('Authorization="[REDACTE...');
    expect(message).toContain('API_KEY="[REDACTE...');
    expect(message).toContain('DATABASE_PASSWORD="[REDACTE...');
    expect(message).toContain('token="[REDACTE...');
    expect(message).toContain('safe=abcdefgh...');
    expect(message).not.toContain('secret');
    expect(message).not.toContain('ijk');
  });

  it('normalizes SQL and URL values for log output', () => {
    const sqlWithWhitespace = ['SELECT *', 'FROM users   WHERE id = ?'].join('\n');
    const normalizedSql = ['SELECT *', 'FROM users WHERE id = ?'].join(' ');

    expect(normalizeSqlForLog(sqlWithWhitespace)).toBe(normalizedSql);
    expect(
      normalizeUrlForLog('https://example.test/path?token=secret&name=brawl')
    ).toContain('token=%5BREDACTED%5D');
  });

  it('creates method log keys with class and method names', () => {
    expect(createMethodLogKey('UsersService', 'updateUserFromCrawler')).toBe(
      'UsersService-updateUserFromCrawler'
    );
  });

  it('logs direct caller previous only when provided', () => {
    const logger = {
      error: jest.fn()
    };
    const errorContext = createMethodLogKey(
      'UsersService',
      'updateUserFromCrawler'
    );
    const previous = createMethodLogKey('UsersController', 'selectUser');

    logErrorWithContext(
      logger,
      new Error('crawler failed'),
      errorContext,
      { event: 'crawler.refresh.error', target: 'TEST' },
      { previous }
    );

    expect(logger.error).toHaveBeenCalledTimes(1);
    expect(logger.error.mock.calls[0][0]).toContain(`previous=${previous}`);
    expect(logger.error.mock.calls[0][2]).toBe(errorContext);
  });
});
