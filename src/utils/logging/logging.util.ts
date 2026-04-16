import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export type ServiceLogMode = 'off' | 'error-slow' | 'all';

export type LogContext = {
  runId?: string;
  parentRunId?: string;
  role?: string;
  requestId?: string;
  target?: string;
};

export type LogFields = LogContext & Record<string, unknown>;

type LogMessageOptions = {
  context?: LogContext | false;
  maxLength?: number;
};

type ErrorLogger = {
  error: (message: unknown, stack?: string, context?: string) => void;
};

const logContextStorage = new AsyncLocalStorage<LogContext>();
const sensitiveKeyPattern =
  /^(authorization|api[_-]?key|database[_-]?password|password|token|secret|credential|access[_-]?key|private[_-]?key|secret[_-]?key|key)$/i;
const defaultMaxValueLength = 500;

export function createRunId(prefix = 'run'): string {
  return `${sanitizeRunIdPart(prefix)}-${Date.now().toString(36)}-${randomUUID().slice(0, 8)}`;
}

export function createMethodLogKey(className: string, methodName: string): string {
  return `${String(className || '').trim() || 'UnknownClass'}-${String(methodName || '').trim() || 'unknownMethod'}`;
}

export function getLogContext(): LogContext {
  return logContextStorage.getStore() || {};
}

export function withLogContext<T>(context: LogContext, callback: () => T): T {
  const parent = getLogContext();
  return logContextStorage.run(mergeLogContext(parent, context), callback);
}

export function formatLogFields(
  fields: LogFields,
  options: LogMessageOptions = {}
): string {
  const baseContext =
    options.context === false ? {} : options.context || getLogContext();
  const normalizedFields = normalizeLogFields({ ...baseContext, ...fields });
  const maxLength = options.maxLength || defaultMaxValueLength;

  return Object.entries(normalizedFields)
    .filter(([, value]) => value !== undefined)
    .map(([key, value]) => `${key}=${formatLogValue(key, value, maxLength)}`)
    .join(' ');
}

export function redactLogValue(key: string, value: unknown): unknown {
  if (isSensitiveKey(key)) {
    return value === undefined || value === null || value === ''
      ? value
      : '[REDACTED]';
  }

  if (Array.isArray(value)) {
    return value.map((item) => redactLogValue(key, item));
  }

  if (
    value &&
    typeof value === 'object' &&
    !(value instanceof Error) &&
    !(value instanceof Date)
  ) {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(
        ([childKey, childValue]) => [
          childKey,
          redactLogValue(childKey, childValue)
        ]
      )
    );
  }

  return value;
}

export function truncateLogValue(
  value: unknown,
  maxLength = defaultMaxValueLength
): string {
  const text = typeof value === 'string' ? value : safeJsonStringify(value);
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
}

export function normalizeSqlForLog(sql: string, maxLength = 1000): string {
  return truncateLogValue(String(sql || '').replace(/\s+/g, ' ').trim(), maxLength);
}

export function normalizeUrlForLog(url: string, maxLength = 500): string {
  try {
    const parsed = new URL(url);
    for (const key of Array.from(parsed.searchParams.keys())) {
      if (isSensitiveKey(key)) {
        parsed.searchParams.set(key, '[REDACTED]');
      }
    }
    return truncateLogValue(parsed.toString(), maxLength);
  } catch (_error) {
    return truncateLogValue(url, maxLength);
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  const errorLike = error as { message?: unknown };
  if (errorLike?.message) {
    return String(errorLike.message);
  }

  return truncateLogValue(error, 300);
}

export function getErrorStack(error: unknown): string | undefined {
  if (error instanceof Error) {
    return error.stack || error.message;
  }

  const stack = (error as { stack?: unknown })?.stack;
  return stack ? String(stack) : undefined;
}

export function getErrorCode(error: unknown): string | undefined {
  const errorLike = error as {
    code?: unknown;
    errno?: unknown;
    driverError?: { code?: unknown; errno?: unknown };
    cause?: { code?: unknown };
  };
  const code =
    errorLike?.code ??
    errorLike?.driverError?.code ??
    errorLike?.cause?.code ??
    errorLike?.errno ??
    errorLike?.driverError?.errno;

  return code === undefined || code === null || code === ''
    ? undefined
    : String(code);
}

export function getErrorStatus(error: unknown): number | undefined {
  const errorLike = error as {
    status?: unknown;
    response?: { status?: unknown };
    getStatus?: () => number;
  };

  const status =
    typeof errorLike?.getStatus === 'function'
      ? errorLike.getStatus()
      : Number(errorLike?.response?.status ?? errorLike?.status);

  return Number.isFinite(status) ? status : undefined;
}

export function parseLogMode(
  value: string | undefined,
  fallback: ServiceLogMode = 'error-slow'
): ServiceLogMode {
  const normalized = String(value || '').trim().toLowerCase();
  if (
    normalized === 'off' ||
    normalized === 'all' ||
    normalized === 'error-slow'
  ) {
    return normalized;
  }

  return fallback;
}

export function parsePositiveInt(value: string | undefined, fallback: number): number {
  const parsed = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function parseBoolean(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value === null || value === '') {
    return fallback;
  }

  return ['1', 'true', 'yes', 'on'].includes(
    String(value).trim().toLowerCase()
  );
}

export function logErrorWithContext(
  logger: ErrorLogger,
  error: unknown,
  errorContext: string,
  fields: LogFields = {},
  options: Omit<LogMessageOptions, 'context'> & {
    stack?: string;
    context?: LogContext | false;
    previous?: string;
  } = {}
): void {
  const messageFields = { ...fields } as LogFields;

  if (messageFields.error === undefined) {
    messageFields.error = getErrorMessage(error);
  }

  if (messageFields.code === undefined) {
    messageFields.code = getErrorCode(error);
  }

  if (messageFields.previous === undefined && options.previous !== undefined) {
    messageFields.previous = options.previous;
  }

  logger.error(
    formatLogFields(messageFields, {
      context: options.context,
      maxLength: options.maxLength
    }),
    options.stack ?? getErrorStack(error),
    errorContext
  );
}

function mergeLogContext(parent: LogContext, context: LogContext): LogContext {
  return Object.fromEntries(
    Object.entries({ ...parent, ...context }).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  ) as LogContext;
}

function normalizeLogFields(fields: LogFields): LogFields {
  return Object.fromEntries(
    Object.entries(fields).filter(
      ([, value]) =>
        typeof value !== 'function' &&
        value !== undefined &&
        value !== null &&
        value !== ''
    )
  ) as LogFields;
}

function formatLogValue(key: string, value: unknown, maxLength: number): string {
  const redacted = redactLogValue(key, value);
  const text = truncateLogValue(redacted, maxLength);

  if (/^[A-Za-z0-9_./:@#%+-]+$/.test(text)) {
    return text;
  }

  return `"${text
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\r?\n/g, '\\n')}"`;
}

function safeJsonStringify(value: unknown): string {
  if (value instanceof Error) {
    return value.message;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch (_error) {
    return String(value);
  }
}

function isSensitiveKey(key: string): boolean {
  return sensitiveKeyPattern.test(key);
}

function sanitizeRunIdPart(value: string): string {
  return (
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 32) || 'run'
  );
}
