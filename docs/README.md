# Service Work Harness

Use this file as the service work harness. Entry files such as `../AGENTS.md` and `AGENTS.md` should stay short and route agents here.

## Path Convention

Paths in this file are relative to this `docs/` directory unless they start with `../`.

## Required Flow

1. If starting from this file, read `../../AGENTS.md`.
2. Read `../AGENTS.md`.
3. Read this file.
4. Open only the detailed docs needed for the task.

## Task Routes

- Any service implementation: `rules/project.md`.
- API, DTO, controller, or response work: `rules/api.md`.
- Entity, query, schema, cache, or partition work: `rules/database.md`.
- Frontend UI, hooks, routing, or service-layer work: `rules/project.md` and `rules/api.md`.
- Behavior change or refactor: `rules/testing.md` and `rules/validation.md`.
- Docs or workflow changes: `rules/harness-engineering.md` and `rules/documentation.md`.
- Cross-module or schema-boundary work: `architecture/workspace.md` and `architecture/module-boundaries.md`.

## Work Loop

1. Choose the smallest route that matches the task.
2. Inspect the current code or docs before editing.
3. Make scoped changes in the owning module.
4. Run the narrowest useful validation.
5. Move durable lessons into focused docs instead of entry files.

## Local Defaults

- Keep controllers thin and delegate domain logic to services.
- Validate request payloads and query params explicitly.
- Keep API response shapes stable for `frontend/src/services`.
- Route frontend API calls through `frontend/src/services` when a service exists.
- Keep page components focused on composition and presentation.
- Coordinate table, column, and partition assumptions with `crawler/`.
- Never expose env values, tokens, or secrets in logs, responses, or docs.
- Do not recreate deprecated `.aiassistant/rules/*` detail trees.

## Validation

- Production check: `npm run build`.
- API tests when relevant: `npm run test`.
- API dev server when needed: `npm run start:dev`.
- Frontend dev server when needed: `npm run frontend:dev`.
- Docs-only changes: file presence and readable Markdown checks are enough.
