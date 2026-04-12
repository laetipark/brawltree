# Service Module Boundaries

## API Runtime

- Owns `/api/*` contracts, DTO validation, controllers, services, repositories, and query behavior.
- Keep controllers thin and move business logic into services.
- Do not duplicate crawler ingestion or worker logic in API services.
- Coordinate schema assumptions with crawler migrations and entities.

## Frontend Runtime

- Owns route composition, UI state, presentation, and same-origin API usage.
- Call APIs through `frontend/src/services` when a service exists.
- Do not embed crawler implementation details in UI components.
- Use `frontend/src/common/config/config.ts` for API base URL and CDN constants.

## Integration Rules

- When changing API response shape, update service DTO/service behavior and frontend service/types together.
- When changing DB schema or partition behavior, update crawler migration/entity behavior and service query expectations together.
- Keep proxy-backed frontend paths `/cdn`, `/youtube`, and `/inbox` stable unless the consumer code changes in the same task.
