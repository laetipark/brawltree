# Service Database Rules

## Baseline

- Database target: MySQL 8.
- ORM: TypeORM.
- `crawler/` owns schema creation, migrations, seeds, partitions, and ingestion writes.
- `service/` reads crawler-managed tables and must keep entity/query assumptions aligned with crawler schema.
- Do not enable TypeORM `synchronize` for production-like schema management.

## Queries

- Use TypeORM query builders for non-trivial joins, aggregates, JSON aggregation, season windows, and battle table unions.
- Normalize query inputs before building conditions.
- Type raw rows explicitly when using `getRawOne` or `getRawMany`.
- Keep expensive read cache keys parameter-based and explicit.
- Keep live-like cache TTLs short and environment-tunable.
- Bound in-memory cache growth and prune entries by expiry.

## Schema Coordination

- Keep service entities aligned with crawler migrations and table semantics.
- Do not change table or column meaning without updating crawler schema docs or migrations in the same coordinated task.
- Preserve access patterns used by heavy reads: user/time/match/map and user/player/time/match/brawler.
- Read partition metadata through `INFORMATION_SCHEMA.PARTITIONS`.

## Safety

- Frontend code must not depend on table implementation details.
- Keep DB hosts, credentials, timezones, pool sizes, and role toggles in env/config.
- Never commit real credentials, private hosts, private IPs, or tokens.
