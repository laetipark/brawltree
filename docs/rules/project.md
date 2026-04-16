# Service Project Rules

Use this as the merged backend and embedded frontend rule source.

## Ownership

- `src/` owns Nest controllers, DTOs, services, repositories, entities, request validation, and `/api/*` response contracts.
- `frontend/src/` owns route composition, UI state, presentation, hooks, contexts, and same-origin API usage.
- `crawler/` owns ingestion, migrations, seeds, partitions, and write-side schema maintenance.
- The integrated Nest runtime owns static frontend serving and proxy pass-through for `/cdn`, `/youtube`, and `/inbox`.

## Implementation Defaults

- Preserve public route paths and response keys unless a task explicitly changes a contract.
- Keep controllers thin: parse params/query/body, call services, return shaped objects, and throw Nest exceptions for invalid requests.
- Keep query construction, cache handling, response assembly, and domain rules out of controllers.
- Prefer feature-local helpers before adding broad shared abstractions.
- Keep response types aligned with `frontend/src/services` in the same change.
- Keep frontend API calls in `frontend/src/services` when a service exists.
- Keep pages focused on composition and move loading/retry/derived state into hooks.
- Keep side effects in hooks or `useEffect`, not inline render branches.
- Reuse existing components and SCSS module patterns before adding new UI patterns.

## Refactor Rules

- Refactor behavior-preservingly by default.
- Split large services by responsibility: input normalization, query setup, cache policy, raw-row mapping, and response assembly.
- Split large page containers by responsibility: route params, data loading, menu state, SEO derivation, and context value assembly.
- Remove dead commented code when it does not preserve a public contract.
- If a public contract would change, stop and make the migration explicit.

## Comment Policy

- Comments should be sparse and useful, but new or refactored TypeScript/TSX declaration surfaces must document intent when they are part of a durable module contract.
- Use Korean JSDoc on class declarations, injectable services/controllers/entities/DTOs, class fields, and class methods when touching those declarations. The JSDoc should explain responsibility, contract, cache/DB assumptions, or side effects rather than restating the identifier.
- Use Korean JSDoc on exported React components, hooks, and domain helpers when they coordinate API calls, route state, SEO, cache, or user-facing data mapping.
- Use Korean line comments for non-obvious logic only: complex SQL intent, aggregation invariants, retry/load sequencing, cache/lock behavior, or cross-context coordination.
- Do not add comments to imports, style-only code, or trivial assignments. Prefer clearer names and smaller helpers before explanatory comments.

## Agent Communication

- Codex should answer the user in Korean unless the user explicitly requests another language.

## Validation

- Default production check: `npm run build`.
- Run `npm run test` when backend service/controller/query behavior changes.
- Run `npm --prefix frontend run build` or the full production build when frontend behavior changes.
- For docs-only changes, readable Markdown and file placement checks are enough.
