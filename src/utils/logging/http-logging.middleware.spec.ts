import { Logger } from '@nestjs/common';
import { EventEmitter } from 'node:events';

import { createHttpLoggingMiddleware } from './http-logging.middleware';
import { formatLogFields } from './logging.util';

describe('createHttpLoggingMiddleware', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  const createResponse = () => {
    const response = new EventEmitter() as any;
    response.statusCode = 200;
    response.setHeader = jest.fn();
    return response;
  };

  beforeEach(() => {
    process.env.SERVICE_HTTP_LOG_MODE = 'error-slow';
    process.env.SERVICE_HTTP_SLOW_MS = '3000';
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    delete process.env.SERVICE_HTTP_LOG_MODE;
    delete process.env.SERVICE_HTTP_SLOW_MS;
  });

  it('sets request id header and carries context into next handlers', () => {
    process.env.SERVICE_HTTP_LOG_MODE = 'off';
    const middleware = createHttpLoggingMiddleware();
    const request = {
      headers: { 'x-request-id': 'req-123' },
      method: 'GET',
      originalUrl: '/api/test'
    } as any;
    const response = createResponse();
    let innerLog = '';

    middleware(request, response, () => {
      innerLog = formatLogFields({ event: 'inside.request' });
    });

    expect(response.setHeader).toHaveBeenCalledWith('X-Request-Id', 'req-123');
    expect(innerLog).toContain('runId=req-123');
    expect(innerLog).toContain('requestId=req-123');
  });

  it('logs error responses in error-slow mode', () => {
    const middleware = createHttpLoggingMiddleware();
    const request = {
      headers: {},
      method: 'POST',
      originalUrl: '/api/fail'
    } as any;
    const response = createResponse();

    middleware(request, response, () => undefined);
    response.statusCode = 500;
    response.emit('finish');

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const message = warnSpy.mock.calls[0][0];
    expect(message).toContain('event=http.server.response');
    expect(message).toContain('method=POST');
    expect(message).toContain('path=/api/fail');
    expect(message).toContain('status=500');
  });
});
