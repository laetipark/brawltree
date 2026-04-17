---
apply: always
---

# Service Assistant Harness

Use this entry for service-only assistant work. It is a local router, not the full service manual.

## Path Convention

Paths in this file are relative to the service repository root unless they start with `..\`.

## Read Order

1. `..\AGENTS.md`
2. `..\.aiassistant\rules\README.md`
3. `AGENTS.md`
4. This file.
5. `docs/README.md`
6. Open only the detailed docs needed for the task.

## Task Routes

- Any service implementation: `docs/rules/project.md`.
- API, DTO, controller, or response work: `docs/rules/api.md`.
- Entity, query, schema, cache, or partition work: `docs/rules/database.md`.
- Behavior change or refactor: `docs/rules/testing.md` and `docs/rules/validation.md`.
- Frontend UI, hooks, routing, or service-layer work: `docs/rules/project.md` and `docs/rules/api.md`.

## Response Language

- Answer the user in Korean for all user-facing responses, unless the user explicitly asks for another language.

## Scope

- API source: `src/`.
- Embedded frontend source: `frontend/src/`.
- Stack: NestJS, TypeScript, TypeORM, MySQL, React, Vite, SCSS.
- Use local `docs/` for service, API, database, testing, validation, and documentation rules.
- Keep API response contracts stable for frontend consumers.
- Keep frontend API usage aligned with backend contracts.
- If crawler schema assumptions are touched, coordinate with crawler rules.
- Do not add detailed implementation policy to this file; promote durable detail to focused `docs/` pages.
