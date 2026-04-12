# Service Database Rules

## Baseline

- Database target: MySQL 8.
- ORM: TypeORM.
- `crawler/` owns schema creation, migrations, seeds, partition maintenance, and ingestion writes.
- `service/` reads crawler-managed tables and must keep entity/query assumptions aligned with crawler schema.
- Do not enable TypeORM `synchronize` for production-like schema management.

## Query Rules

- Use TypeORM query builder for non-trivial joins, aggregates, JSON aggregation, season windows, and union-like battle table reads.
- Normalize query inputs before building query conditions.
- Type raw rows explicitly when using `getRawOne` or `getRawMany`.
- Keep high-cost read cache keys parameter-based and explicit.
- Keep live-like cache TTLs short and environment-tunable.
- Prune in-memory cache entries by expiry and keep cache size bounded.

## Schema Coordination

- Keep service entities aligned with crawler migration SQL and table semantics.
- Do not change table or column meaning without updating crawler-owned schema docs or migrations as part of the same coordinated task.
- Preserve access patterns used by heavy read paths: user/time/match/map and user/player/time/match/brawler.
- Keep partition metadata reads explicit through `INFORMATION_SCHEMA.PARTITIONS`.

## Safety

- Frontend code must not rely on table implementation details.
- Keep DB host, credentials, timezone, pool sizes, and role toggles in env files or config.
- Never commit real credentials, private hosts, private IPs, or tokens.
