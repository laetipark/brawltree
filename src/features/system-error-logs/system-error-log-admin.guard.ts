import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SystemErrorLogAdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const configuredToken = process.env.SYSTEM_ERROR_LOG_ADMIN_TOKEN;
    if (!configuredToken) {
      throw new ServiceUnavailableException('SYSTEM_ERROR_LOG_ADMIN_TOKEN is not configured');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const requestToken = request.headers['x-admin-token'];
    const token = Array.isArray(requestToken) ? requestToken[0] : requestToken;

    if (token !== configuredToken) {
      throw new UnauthorizedException('Invalid admin token');
    }

    return true;
  }
}
