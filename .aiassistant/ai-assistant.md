---
apply: always
---

# Service AI Assistant Entry

Use this file as the legacy assistant entry for `service/`.
Treat `service/docs` as the primary rule source.

## Read Order

1. `../AGENTS.md`
2. `../.aiassistant/README.md`
3. `../docs/README.md`
4. `../docs/rules/project.md`

## Execution Policy

- Service scope includes API code in `src/` and embedded frontend code in `frontend/src/`.
- Keep API response contracts stable for frontend consumers.
- Keep frontend API usage aligned with backend contracts.
- If crawler schema assumptions are touched, coordinate with crawler rules.
