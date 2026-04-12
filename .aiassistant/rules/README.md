---
apply: always
---

# Service AI Assistant Rules Entry

Use this entry for service-only Codex work.

## Path Convention

Paths in this file are relative to the service repository root, `D:\BrawlTree\service`, unless they start with `..\`.

## Read Order

1. `AGENTS.md`
2. `..\AGENTS.md`
3. `..\.aiassistant\rules\README.md`
4. `docs/README.md`
5. `docs/rules/project.md`
6. For API, DTO, controller, or response work, read `docs/rules/api.md`.
7. For entity, query, schema, cache, or partition work, read `docs/rules/database.md`.
8. For behavior changes, read `docs/rules/testing.md`.
9. For commit-message requests, read `docs/rules/git.md`.
10. For workspace or cross-repository commit-message requests, also read `..\docs\rules\git.md`.

## Scope

- API source: `src/`.
- Embedded frontend source: `frontend/src/`.
- Stack: NestJS, TypeScript, TypeORM, MySQL, React, Vite, SCSS.
- Use local `docs/` for service, API, database, testing, Git, validation, and documentation rules.
- Keep API response contracts stable for frontend consumers.
- Keep frontend API usage aligned with backend contracts.
- If crawler schema assumptions are touched, coordinate with crawler rules.
