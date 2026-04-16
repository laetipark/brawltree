import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

import {
  createRunId,
  formatLogFields,
  parseLogMode,
  parsePositiveInt,
  withLogContext
} from './logging.util';

const logger = new Logger('HttpServer');

export function createHttpLoggingMiddleware() {
  return (request: Request, response: Response, next: NextFunction): void => {
    const startedAt = Date.now();
    const runId = getRequestId(request) || createRunId('req');
    const context = { runId, requestId: runId, role: 'api' };

    response.setHeader('X-Request-Id', runId);

    withLogContext(context, () => {
      response.on('finish', () => {
        const durationMs = Date.now() - startedAt;
        const status = response.statusCode;
        const mode = parseLogMode(process.env.SERVICE_HTTP_LOG_MODE, 'error-slow');
        const slowMs = parsePositiveInt(process.env.SERVICE_HTTP_SLOW_MS, 3000);
        const isError = status >= 400;
        const isSlow = durationMs >= slowMs;

        if (mode === 'off' || (mode === 'error-slow' && !isError && !isSlow)) {
          return;
        }

        const message = formatLogFields(
          {
            event: 'http.server.response',
            method: request.method,
            path: getRequestPath(request),
            status,
            durationMs
          },
          { context }
        );

        if (isError) {
          logger.warn(message);
          return;
        }

        logger.log(message);
      });

      next();
    });
  };
}

function getRequestId(request: Request): string | undefined {
  const requestId = request.headers['x-request-id'];
  if (Array.isArray(requestId)) {
    return requestId.find(Boolean);
  }

  return requestId || undefined;
}

function getRequestPath(request: Request): string {
  return request.originalUrl || request.url || 'unknown';
}
