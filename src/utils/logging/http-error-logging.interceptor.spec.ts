import { BadRequestException, Logger } from '@nestjs/common';
import { firstValueFrom, throwError } from 'rxjs';

import { HttpErrorLoggingInterceptor } from './http-error-logging.interceptor';
import { withLogContext } from './logging.util';

describe('HttpErrorLoggingInterceptor', () => {
  let errorSpy: jest.SpyInstance;

  beforeEach(() => {
    errorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('logs controller errors and rethrows without changing the response', async () => {
    const interceptor = new HttpErrorLoggingInterceptor();
    const error = new BadRequestException('bad request');
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          method: 'GET',
          originalUrl: '/api/test'
        })
      })
    } as any;
    const callHandler = {
      handle: () => throwError(() => error)
    } as any;

    await expect(
      withLogContext({ runId: 'run-error-1' }, () =>
        firstValueFrom(interceptor.intercept(context, callHandler))
      )
    ).rejects.toBe(error);

    expect(errorSpy).toHaveBeenCalledTimes(1);
    const message = errorSpy.mock.calls[0][0];
    expect(message).toContain('event=http.server.error');
    expect(message).toContain('runId=run-error-1');
    expect(message).toContain('method=GET');
    expect(message).toContain('path=/api/test');
    expect(message).toContain('status=400');
    expect(message).toContain('error="bad request"');
    expect(message).not.toContain('previous=');
    expect(errorSpy.mock.calls[0][2]).toBe(
      'HttpErrorLoggingInterceptor-intercept'
    );
  });
});
