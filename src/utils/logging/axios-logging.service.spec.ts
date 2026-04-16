import { Logger } from '@nestjs/common';

import { AxiosLoggingService } from './axios-logging.service';
import { withLogContext } from './logging.util';

describe('AxiosLoggingService', () => {
  let logSpy: jest.SpyInstance;
  let warnSpy: jest.SpyInstance;

  const createService = () => {
    let requestHandler: (config: any) => any;
    let responseHandler: (response: any) => any;
    let errorHandler: (error: any) => Promise<never>;
    const axiosRef = {
      interceptors: {
        request: {
          use: jest.fn((handler) => {
            requestHandler = handler;
          })
        },
        response: {
          use: jest.fn((handler, error) => {
            responseHandler = handler;
            errorHandler = error;
          })
        }
      }
    };

    const service = new AxiosLoggingService({ axiosRef } as any);
    service.onModuleInit();

    return {
      requestHandler: requestHandler!,
      responseHandler: responseHandler!,
      errorHandler: errorHandler!
    };
  };

  beforeEach(() => {
    process.env.SERVICE_HTTP_LOG_MODE = 'error-slow';
    process.env.SERVICE_HTTP_SLOW_MS = '3000';
    delete process.env.SERVICE_LOG_HTTP_BODY;
    logSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    logSpy.mockRestore();
    warnSpy.mockRestore();
    delete process.env.SERVICE_HTTP_LOG_MODE;
    delete process.env.SERVICE_HTTP_SLOW_MS;
    delete process.env.SERVICE_LOG_HTTP_BODY;
  });

  it('does not log fast successful responses by default', () => {
    const { requestHandler, responseHandler } = createService();
    const config = withLogContext({ runId: 'run-http-1' }, () =>
      requestHandler({
        method: 'get',
        baseURL: 'https://api.test',
        url: '/ok'
      })
    );

    responseHandler({ status: 200, data: { ok: true }, config });

    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('logs errors with runId, status, code, and reason', async () => {
    const { requestHandler, errorHandler } = createService();
    const config = withLogContext({ runId: 'run-http-2' }, () =>
      requestHandler({
        method: 'post',
        baseURL: 'https://api.test',
        url: '/fail?token=secret'
      })
    );
    const error = Object.assign(new Error('request failed'), {
      code: 'ECONNRESET',
      config,
      response: {
        status: 500,
        data: { message: 'upstream failed' },
        config
      }
    });

    await expect(errorHandler(error)).rejects.toBe(error);

    expect(warnSpy).toHaveBeenCalledTimes(1);
    const message = warnSpy.mock.calls[0][0];
    expect(message).toContain('event=http.client.response');
    expect(message).toContain('runId=run-http-2');
    expect(message).toContain('status=500');
    expect(message).toContain('code=ECONNRESET');
    expect(message).toContain('reason="upstream failed"');
    expect(message).toContain('token=%5BREDACTED%5D');
  });

  it('logs slow successful responses in error-slow mode', () => {
    const { requestHandler, responseHandler } = createService();
    const config = requestHandler({
      method: 'get',
      baseURL: 'https://api.test',
      url: '/slow'
    });
    config.brawltreeLog.startTime = Date.now() - 3500;

    responseHandler({ status: 200, data: { ok: true }, config });

    expect(logSpy).toHaveBeenCalledTimes(1);
    expect(logSpy.mock.calls[0][0]).toContain('event=http.client.response');
    expect(logSpy.mock.calls[0][0]).toContain('status=200');
    expect(logSpy.mock.calls[0][0]).toContain('durationMs=');
  });
});
