import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  AxiosError,
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig
} from 'axios';

import {
  createRunId,
  formatLogFields,
  getErrorCode,
  getLogContext,
  normalizeUrlForLog,
  parseBoolean,
  parseLogMode,
  parsePositiveInt
} from './logging.util';

type AxiosLogMetadata = {
  startTime: number;
  runId: string;
};

type LoggedAxiosConfig = InternalAxiosRequestConfig & {
  brawltreeLog?: AxiosLogMetadata;
};

@Injectable()
export class AxiosLoggingService implements OnModuleInit {
  private static readonly registeredInstances = new WeakSet<AxiosInstance>();
  private readonly logger = new Logger(AxiosLoggingService.name);

  constructor(private readonly httpService: HttpService) {}

  onModuleInit(): void {
    const axiosRef = this.httpService.axiosRef;
    if (!axiosRef || AxiosLoggingService.registeredInstances.has(axiosRef)) {
      return;
    }

    AxiosLoggingService.registeredInstances.add(axiosRef);
    axiosRef.interceptors.request.use((config) => this.onRequest(config));
    axiosRef.interceptors.response.use(
      (response) => this.onResponse(response),
      (error) => this.onError(error)
    );
  }

  private onRequest(
    config: InternalAxiosRequestConfig
  ): InternalAxiosRequestConfig {
    const context = getLogContext();
    (config as LoggedAxiosConfig).brawltreeLog = {
      startTime: Date.now(),
      runId: context.runId || createRunId('http')
    };

    return config;
  }

  private onResponse(response: AxiosResponse): AxiosResponse {
    this.logResponse(response);
    return response;
  }

  private onError(error: AxiosError): Promise<never> {
    this.logResponse(error.response, error);
    return Promise.reject(error);
  }

  private logResponse(response?: AxiosResponse, error?: AxiosError): void {
    const config = (response?.config ||
      error?.config ||
      {}) as LoggedAxiosConfig;
    const metadata = config.brawltreeLog || {
      startTime: Date.now(),
      runId: getLogContext().runId || createRunId('http')
    };
    const durationMs = Date.now() - metadata.startTime;
    const status = response?.status || error?.response?.status;
    const mode = parseLogMode(process.env.SERVICE_HTTP_LOG_MODE, 'error-slow');
    const slowMs = parsePositiveInt(process.env.SERVICE_HTTP_SLOW_MS, 3000);
    const isError =
      !!error || (Number.isFinite(Number(status)) && Number(status) >= 400);
    const isSlow = durationMs >= slowMs;

    if (mode === 'off' || (mode === 'error-slow' && !isError && !isSlow)) {
      return;
    }

    const fields = {
      event: 'http.client.response',
      status: status || 'unknown',
      method: String(config.method || 'GET').toUpperCase(),
      url: this.getUrl(config),
      durationMs,
      runId: metadata.runId,
      code: getErrorCode(error),
      reason: this.getResponseReason(response, error),
      responseBody: this.getResponseBody(response, error)
    };

    if (isError) {
      this.logger.warn(formatLogFields(fields));
      return;
    }

    this.logger.log(formatLogFields(fields));
  }

  private getUrl(config: Partial<InternalAxiosRequestConfig>): string {
    const url = String(config.url || '');
    const baseURL = String(config.baseURL || '');

    if (!baseURL) {
      return normalizeUrlForLog(url || 'unknown');
    }

    try {
      return normalizeUrlForLog(new URL(url, baseURL).toString());
    } catch (_error) {
      return normalizeUrlForLog(`${baseURL}${url}`);
    }
  }

  private getResponseReason(
    response?: AxiosResponse,
    error?: AxiosError
  ): string | undefined {
    const data = response?.data || error?.response?.data;
    if (!data) {
      return error?.message;
    }

    if (typeof data === 'string') {
      return data;
    }

    const dataLike = data as {
      reason?: unknown;
      message?: unknown;
      error?: unknown;
    };
    const reason = dataLike.reason || dataLike.message || dataLike.error;
    return reason ? String(reason) : error?.message;
  }

  private getResponseBody(response?: AxiosResponse, error?: AxiosError): unknown {
    if (!parseBoolean(process.env.SERVICE_LOG_HTTP_BODY, false)) {
      return undefined;
    }

    return response?.data || error?.response?.data;
  }
}
