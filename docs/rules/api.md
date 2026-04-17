# Service API Rules

## Contracts

- `/api/*` routes are contracts for `frontend/src/services` and possible external consumers.
- Do not add a global response envelope unless all affected consumers are migrated in the same task.
- Preserve response property names unless the task explicitly requires a contract change.
- When response shape changes, update backend DTO/service types, frontend service types, and callers together.

## Controllers

- Controllers parse params, query, and body; call services; shape the final response; and throw Nest exceptions.
- Do not put TypeORM query builders, cache logic, aggregation logic, or domain rules in controllers.
- Validate new request inputs explicitly.
- Keep client-facing errors stable and safe; log root-cause detail server-side only.

## DTOs And Types

- Define DTOs for reused, non-trivial, or frontend-consumed responses.
- Do not return TypeORM entities directly where the API already returns shaped objects.
- Type raw query rows separately from response DTOs when shapes differ.
- Normalize battle filters such as `type`, `mode`, and `stack` before query construction.

## Frontend Usage

- Route frontend calls through `frontend/src/services` when a service exists.
- Keep service-specific response types near the frontend service.
- UI components should not construct API URLs directly unless no service layer exists yet.
