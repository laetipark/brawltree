import { ServiceUnavailableException, UnauthorizedException } from '@nestjs/common';

import { SystemErrorLogAdminGuard } from './system-error-log-admin.guard';

const createContext = (token?: string) =>
  ({
    switchToHttp: () => ({
      getRequest: () => ({
        headers: token ? { 'x-admin-token': token } : {}
      })
    })
  }) as any;

describe('SystemErrorLogAdminGuard', () => {
  const originalToken = process.env.SYSTEM_ERROR_LOG_ADMIN_TOKEN;

  afterEach(() => {
    if (originalToken === undefined) {
      delete process.env.SYSTEM_ERROR_LOG_ADMIN_TOKEN;
    } else {
      process.env.SYSTEM_ERROR_LOG_ADMIN_TOKEN = originalToken;
    }
  });

  it('allows requests with the configured admin token', () => {
    process.env.SYSTEM_ERROR_LOG_ADMIN_TOKEN = 'admin-secret';

    expect(new SystemErrorLogAdminGuard().canActivate(createContext('admin-secret'))).toBe(true);
  });

  it('rejects requests when the token is missing or invalid', () => {
    process.env.SYSTEM_ERROR_LOG_ADMIN_TOKEN = 'admin-secret';

    expect(() => new SystemErrorLogAdminGuard().canActivate(createContext('wrong'))).toThrow(UnauthorizedException);
  });

  it('fails closed when the admin token is not configured', () => {
    delete process.env.SYSTEM_ERROR_LOG_ADMIN_TOKEN;

    expect(() => new SystemErrorLogAdminGuard().canActivate(createContext('admin-secret'))).toThrow(ServiceUnavailableException);
  });
});
