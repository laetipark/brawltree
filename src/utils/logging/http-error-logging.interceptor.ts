import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor
} from '@nestjs/common';
import { Request } from 'express';
import { Observable, catchError, throwError } from 'rxjs';

import {
  createMethodLogKey,
  formatLogFields,
  getErrorCode,
  getErrorMessage,
  getErrorStatus,
  logErrorWithContext
} from './logging.util';

@Injectable()
export class HttpErrorLoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(HttpErrorLoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const startedAt = Date.now();
    const request = context.switchToHttp().getRequest<Request>();

    return next.handle().pipe(
      catchError((error: unknown) => {
        logErrorWithContext(
          this.logger,
          error,
          createMethodLogKey(HttpErrorLoggingInterceptor.name, 'intercept'),
          {
            event: 'http.server.error',
            method: request?.method,
            path: request?.originalUrl || request?.url,
            status: getErrorStatus(error) || 500,
            durationMs: Date.now() - startedAt,
            error: getErrorMessage(error),
            code: getErrorCode(error)
          }
        );

        return throwError(() => error);
      })
    );
  }
}
