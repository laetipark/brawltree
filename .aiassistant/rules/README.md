---
apply: always
---

# Service AI Assistant Entry

Use this file as the legacy assistant entry for `service/`.
Treat `D:\BrawlTree\service\docs` as the primary rule source.

## Path Convention

Paths in this file are relative to the service repository root, `D:\BrawlTree\service`, unless they start with `..\`.

## Read Order

1. `AGENTS.md`
2. `..\AGENTS.md`
3. `..\.aiassistant\rules\README.md`
4. `docs/README.md`
5. `docs/rules/project.md`
6. For commit-message requests, read `docs/rules/git.md`.
7. For workspace or cross-repository commit-message requests, also read `..\docs\rules\git.md`.

## Execution Policy

- Service scope includes API code in `src/` and embedded frontend code in `frontend/src/`.
- Keep API response contracts stable for frontend consumers.
- Keep frontend API usage aligned with backend contracts.
- If crawler schema assumptions are touched, coordinate with crawler rules.
