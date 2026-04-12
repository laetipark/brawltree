# Service API Rules

## Public Contracts

- Routes under `/api/*` are public contracts consumed by `frontend/src/services` and may also be consumed outside the frontend.
- Do not introduce a global response envelope unless every affected frontend service and consumer is migrated in the same task.
- Preserve existing response property names unless the task explicitly requires a contract change.
- If a response shape changes, update the backend DTO/service return type, frontend service response type, and consumer expectations together.

## Controllers

- Controllers should only parse inputs, call services, shape the final response object, and throw Nest exceptions.
- Controllers must not contain TypeORM query builders, cache logic, or aggregation logic.
- Use explicit params/query/body validation for new inputs.
- Keep client-facing errors stable and safe. Log root-cause detail server-side only.

## DTOs and Types

- Define or update DTOs when a response is reused, non-trivial, or consumed by frontend services.
- Do not return TypeORM entities directly when the API already returns shaped objects.
- Type raw query rows separately from DTOs when the raw shape differs from the response shape.
- Keep battle filters explicit: normalize `type`, `mode`, and `stack` before query construction.

## Frontend Usage

- Route frontend calls through `frontend/src/services` when a service exists.
- Put service-specific response types near the frontend service.
- UI components should not construct API URLs directly unless no service layer exists yet.
