# Service Project Rules

Use this file for general service implementation work. For API, frontend, database, testing, validation, or docs rules, open the matching file in this directory.

## Backend Ownership

- `src/` owns NestJS controllers, DTOs, services, repositories, entities, validation, and `/api/*` response contracts.
- `crawler/` owns ingestion writes, migrations, seeds, partitions, and write-side schema maintenance.
- The integrated Nest runtime serves the frontend and proxies `/cdn`, `/youtube`, and `/inbox`.

## Implementation

- Preserve public route paths and response keys unless the task explicitly changes a contract.
- Keep domain logic in services or feature-local helpers.
- Keep query construction, cache policy, and row mapping out of controllers.
- Prefer feature-local helpers before adding broad shared abstractions.
- Preserve existing environment variable names unless a migration path is explicit.
- Prefer existing local patterns before introducing new abstractions.

## Refactoring

- Preserve behavior by default.
- Split large backend services by responsibility: normalization, query setup, cache policy, row mapping, and response assembly.
- Remove dead commented code when it does not preserve a public contract.

## Comments

- Add comments only for durable contracts or non-obvious logic.
- Use Korean JSDoc when touching exported declarations whose responsibility, side effect, cache, DB, or API contract is not obvious.
- Do not comment imports, trivial assignments, or style-only code.
