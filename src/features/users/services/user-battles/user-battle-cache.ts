type QueryCacheEntryType<T> = {
  expiresAt: number;
  value: T;
};

const DEFAULT_QUERY_CACHE_TTL_MS = 15000;
const MIN_QUERY_CACHE_TTL_MS = 1000;
const DEFAULT_QUERY_CACHE_MAX_ENTRIES = 1000;

export const resolveBattleQueryCacheTtlMs = (
  ttlValue: string | undefined
): number => {
  const parsedTtlMs = Number.parseInt(ttlValue || '', 10);

  if (!Number.isFinite(parsedTtlMs) || parsedTtlMs <= 0) {
    return DEFAULT_QUERY_CACHE_TTL_MS;
  }

  return Math.max(MIN_QUERY_CACHE_TTL_MS, parsedTtlMs);
};

export class UserBattleQueryCache {
  private readonly cache = new Map<string, QueryCacheEntryType<unknown>>();

  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries = DEFAULT_QUERY_CACHE_MAX_ENTRIES
  ) {}

  buildKey(...parts: Array<string | number>): string {
    return parts.map((part) => String(part)).join(':');
  }

  get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      return null;
    }

    if (cached.expiresAt <= Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return cached.value as T;
  }

  set<T>(key: string, value: T): void {
    if (this.cache.size > this.maxEntries) {
      this.pruneExpiredEntries();
    }

    this.cache.set(key, {
      value,
      expiresAt: Date.now() + this.ttlMs
    });
  }

  private pruneExpiredEntries(): void {
    const now = Date.now();

    for (const [cacheKey, cacheEntry] of this.cache.entries()) {
      if (cacheEntry.expiresAt <= now) {
        this.cache.delete(cacheKey);
      }
    }
  }
}
