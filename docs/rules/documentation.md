# Service Documentation Rules

## Purpose

Service docs should preserve durable project knowledge without turning entry files into manuals.

## File Roles

- Service `AGENTS.md`: service agent entrypoint with read order, scope, response language, and safety constraints.
- Service `CLAUDE.md`: service Claude entrypoint with read order, scope, response language, and safety constraints.
- Service `docs/README.md`: service work harness for task routing, document selection, and validation direction.
- `rules/agent-entrypoints.md`: rules for `CLAUDE.md`, `AGENTS.md`, and harness routing changes.
- `rules/harness-engineering.md`: harness pattern, route design, and work-loop rules.
- `rules/project.md`: general backend service implementation, refactoring, and comments.
- `rules/api.md`: API contracts, controllers, DTOs, and frontend consumer compatibility.
- `rules/frontend.md`: frontend routes, hooks, services, config, UI state, and SCSS.
- `rules/database.md`: TypeORM, MySQL, query, cache, schema, and crawler alignment.
- `rules/testing.md`: test priorities, scenarios, fixtures, and mocks.
- `rules/validation.md`: narrow validation command selection and reporting.
- `architecture/*`: workspace data flow and cross-module boundaries.

## Classification

- Keep entrypoint rules in `rules/agent-entrypoints.md`.
- Keep task routing and the document map in `README.md`.
- Keep implementation, API, frontend, database, testing, and validation rules in their matching files.
- Keep cross-module ownership and data-flow rules in `architecture/`.
- Move repeated review feedback into the narrowest focused doc that owns the topic.

## Maintenance

- Keep `AGENTS.md` short and route durable workflow detail to `docs/README.md`.
- Put reusable service knowledge in focused `docs/` pages.
- Update docs when a workflow, command, API contract, schema assumption, or module boundary changes.
- Link to existing docs instead of copying long guidance.
- Update `docs/README.md` when adding, removing, or renaming docs.

## Safety

- Do not document real secrets, tokens, private hostnames, private IPs, or production-only credentials.
- Use sample env variable names only.
- Write new docs as UTF-8 Markdown.
- Do not copy mojibake; rewrite from readable sources.
