# Service Workspace Rules

## Shape

- `src/` owns the public API, request validation, service logic, and read queries.
- `frontend/src/` owns route composition, UI state, presentation, and API usage.
- The integrated runtime serves frontend pages from the same Nest process and exposes APIs under `/api/*`.

## Data Flow

1. `crawler/` writes normalized MySQL tables.
2. `service/src` reads those tables and exposes `/api/*` endpoints.
3. `service/frontend/src/services` calls the same-origin API.
4. The service runtime also proxies `/cdn/*`, `/youtube/*`, and `/inbox/*` for frontend use.

## Contract Boundaries

- API/frontend contracts cross `src/` and `frontend/src/services`.
- Schema assumptions cross `crawler/` writes and `service/src` reads.
- Proxy-backed frontend paths cross the integrated Nest runtime and frontend consumers.
