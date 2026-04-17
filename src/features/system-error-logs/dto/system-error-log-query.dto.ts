export type SystemErrorLogResolvedFilter = 'true' | 'false';

export class SystemErrorLogQueryDto {
  source?: string;
  event?: string;
  status?: string;
  resolved?: SystemErrorLogResolvedFilter;
  from?: string;
  to?: string;
  page?: string;
  limit?: string;
}

export class ResolveSystemErrorLogDto {
  note?: string;
}
