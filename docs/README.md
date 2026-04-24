# Service Work Harness

Use this file as the service work harness. Entry files such as `../AGENTS.md` and `../CLAUDE.md` should stay short and route agents here.

## Path Convention

Paths in this file are relative to this `docs/` directory unless they start with `../`.

## Required Flow

1. Start from the active service entrypoint for the current agent, either `../AGENTS.md` or `../CLAUDE.md`, then return here.
2. Do not read parent workspace entrypoints or the other agent's entrypoint unless the user explicitly asks for it.
3. Use this harness to choose the task route.
4. Open only the detailed docs listed for that route.
5. Validate with the narrowest useful check from `rules/validation.md` when validation applies.

## Task Routes

- Agent entrypoints, Claude/Codex rules, or harness routing changes: `rules/agent-entrypoints.md`, `rules/harness-engineering.md`, and `rules/documentation.md`.
- General service implementation, backend refactor, source layout, or comments: `rules/project.md`.
- API, DTO, controller, response, or API/frontend contract work: `rules/api.md`.
- Frontend UI, hooks, routing, service-layer, config, or SCSS work: `rules/frontend.md` and `rules/api.md`.
- Entity, query, schema, cache, or partition work: `rules/database.md`.
- Behavior change or refactor: the owning rules file plus `rules/testing.md` and `rules/validation.md`.
- Docs or workflow changes that do not affect entrypoints: `rules/harness-engineering.md` and `rules/documentation.md`.
- Cross-module or schema-boundary work: `architecture/workspace.md` and `architecture/module-boundaries.md`.

## Document Map

| Role | File |
| --- | --- |
| Agent entrypoint | `../AGENTS.md` |
| Claude entrypoint | `../CLAUDE.md` |
| Work harness and route selection | `README.md` |
| Agent entrypoint rules | `rules/agent-entrypoints.md` |
| Harness workflow rules | `rules/harness-engineering.md` |
| Documentation governance | `rules/documentation.md` |
| General service implementation rules | `rules/project.md` |
| API contract and controller rules | `rules/api.md` |
| Frontend route, hook, service, and UI rules | `rules/frontend.md` |
| Database, query, cache, and schema rules | `rules/database.md` |
| Testing rules | `rules/testing.md` |
| Validation command selection | `rules/validation.md` |
| Workspace data flow | `architecture/workspace.md` |
| Module boundaries | `architecture/module-boundaries.md` |

## Work Loop

1. Choose the smallest route that matches the task.
2. Inspect the current code or docs before editing.
3. Make scoped changes in the owning module.
4. Run the narrowest useful validation.
5. Move durable lessons into focused docs instead of entry files.

## Core Service Contracts

- `crawler/` writes normalized MySQL data; `service/src` reads it and exposes `/api/*`.
- `frontend/src/services` calls the same-origin service API.
- The integrated Nest runtime serves the embedded frontend and proxies `/cdn`, `/youtube`, and `/inbox`.
- Never expose env values, tokens, secrets, private hosts, or private IPs in docs, logs, responses, or code.
- Do not recreate deprecated `.aiassistant/rules/*` detail trees.

## Maintenance

- Keep `CLAUDE.md`, `AGENTS.md`, and this harness aligned without copying long rule text between them.
- Put durable service rules in focused `docs/` pages instead of entry files.
- Link to existing docs instead of copying long guidance.
- Update this harness when adding, removing, or renaming service docs.

## Validation

- Use `rules/validation.md` to choose the narrowest useful command.
- Docs-only changes: file presence and readable Markdown checks are enough.
