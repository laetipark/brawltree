# Service Validation Rules

Run the narrowest useful validation for the files touched. If a command cannot run, report what was not validated and why.

## Commands

- Full production check: `npm run build`
- Backend build only: `npm run build:api`
- Frontend build only: `npm --prefix frontend run build`
- Backend unit/smoke tests: `npm run test`
- API dev server: `npm run start:dev`
- Frontend dev server: `npm run frontend:dev`

## When to Run

- Backend controller/service/query change: `npm run build:api` and `npm run test`
- Frontend route/hook/component/service change: `npm --prefix frontend run build`
- Full-stack contract change: `npm run build` and `npm run test`
- Proxy change: verify `/cdn`, `/youtube`, and `/inbox` behavior through the integrated runtime when practical
- Docs-only change: Markdown readability and file placement are enough

## Reporting

- Report skipped validation explicitly.
- Mention environment blockers separately from code failures.
- Prefer `npm.cmd` on Windows if PowerShell blocks `npm.ps1` execution.
