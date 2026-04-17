# Service Project Rules

Use this file for general `service/` implementation work. For API, database, testing, validation, docs, or Git rules, open the matching file in this directory.

## Ownership

- `src/` owns NestJS controllers, DTOs, services, repositories, entities, validation, and `/api/*` response contracts.
- `frontend/src/` owns React routes, UI state, hooks, contexts, presentation, and same-origin API usage.
- `crawler/` owns ingestion writes, migrations, seeds, partitions, and write-side schema maintenance.
- The integrated Nest runtime serves the frontend and proxies `/cdn`, `/youtube`, and `/inbox`.

## Implementation

- Preserve public route paths and response keys unless the task explicitly changes a contract.
- Keep controllers thin: parse input, call services, shape responses, and throw Nest exceptions.
- Keep query construction, cache policy, response assembly, and domain rules in services or helpers.
- Prefer feature-local helpers before adding broad shared abstractions.
- Keep frontend API calls in `frontend/src/services` when a service layer exists.
- Keep pages focused on composition; move loading, retry, derived state, and side effects into hooks.
- Reuse existing component and SCSS module patterns before introducing new UI patterns.

## Refactoring

- Preserve behavior by default.
- Split large backend services by responsibility: normalization, query setup, cache policy, row mapping, and response assembly.
- Split large frontend containers by responsibility: route params, data loading, menu state, SEO data, and context values.
- Remove dead commented code when it does not preserve a public contract.
- If a public contract changes, update backend and frontend consumers in the same task.

## Comments

- Add comments only for durable contracts or non-obvious logic.
- Use Korean JSDoc when touching exported declarations whose responsibility, side effect, cache, DB, or API contract is not obvious.
- Do not comment imports, trivial assignments, or style-only code.
