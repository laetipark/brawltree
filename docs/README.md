# Service Docs Index

Use this directory as the canonical rule source for `service/` work.

## Read by Task Type

- Any service implementation: `rules/project.md`
- API, DTO, controller, or response work: `rules/api.md`
- Entity, query, schema, cache, or partition work: `rules/database.md`
- Frontend UI, hooks, routing, or service-layer work: `rules/project.md` and `rules/api.md`
- Behavior change or refactor: `rules/testing.md` and `rules/validation.md`
- Docs or workflow changes: `rules/harness-engineering.md` and `rules/documentation.md`
- Cross-module or schema-boundary work: `architecture/workspace.md` and `architecture/module-boundaries.md`

## Local Defaults

- Keep `AGENTS.md` short; put detailed rules here.
- Keep API contracts stable for `frontend/src/services`.
- Keep frontend API usage in `frontend/src/services`.
- Do not recreate deprecated `.aiassistant/rules/*` detail trees.
