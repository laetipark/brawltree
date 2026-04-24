# Service Agent Entrypoint Rules

Use these rules when changing `CLAUDE.md`, `AGENTS.md`, `docs/README.md`, or other agent routing documentation for service work.

## File Roles

- Service `AGENTS.md`: service-specific agent entrypoint with read order, scope, and core constraints.
- Service `CLAUDE.md`: service-specific Claude entrypoint with read order, scope, and core constraints.
- `docs/README.md`: service work harness; it selects the detailed docs needed for a task.
- `docs/rules/*` and `docs/architecture/*`: focused durable rules opened only when selected by the harness.

## Entrypoint Contract

- Entry files must stay short and map-like.
- `CLAUDE.md` and `AGENTS.md` are peer entrypoints for different agents; neither should require reading the other.
- Feature entrypoints should not require parent workspace entrypoints for normal feature-scoped work.
- Each entrypoint should route directly to `docs/README.md` before detailed work.
- `AGENTS.md` must not replace `docs/README.md`; it should require agents to use the harness before detailed work.
- `docs/README.md` is the source of truth for choosing detailed docs and validation routes.
- Do not duplicate long implementation, API, database, frontend, testing, or validation rules across entry files.

## Harness Changes

- When adding, removing, or renaming a detailed doc, update `docs/README.md` in the same change.
- When adding a new task category, add a route that names the smallest useful set of docs.
- Keep route names task-oriented, such as docs changes, API changes, database changes, frontend changes, or validation changes.
- Avoid catch-all routes that encourage opening every doc.

## Safety

- Never document real secrets, tokens, private hosts, private IPs, or production-only credentials.
- Use sample env variable names and runtime role names, not deployment-only values.
- Keep compatibility notes generic unless a concrete local file path is required.
