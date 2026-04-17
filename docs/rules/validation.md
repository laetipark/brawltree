# Service Validation Rules

Run the narrowest useful validation for the files touched. If validation cannot run, report what was skipped and why.

## Commands

- Full production check: `npm run build`
- Backend build: `npm run build:api`
- Frontend build: `npm --prefix frontend run build`
- Backend tests: `npm run test`
- API dev server: `npm run start:dev`
- Frontend dev server: `npm run frontend:dev`

## Selection

- Backend controller/service/query change: `npm run build:api` and relevant tests.
- Frontend route/hook/component/service change: frontend build and relevant tests if available.
- Full-stack contract change: full build plus relevant backend/frontend checks.
- Proxy change: verify `/cdn`, `/youtube`, or `/inbox` behavior through the integrated runtime when practical.
- Docs-only change: readable Markdown and file placement checks are enough.

## Reporting

- Report skipped validation explicitly.
- Separate environment blockers from code failures.
- Prefer `npm.cmd` on Windows if PowerShell blocks `npm.ps1`.
