# Service Codex Rules

Use this file for Codex work inside `service/`.

## Read Order

1. If available, read `../AGENTS.md` for workspace-level rules.
2. Read `../.aiassistant/rules/README.md` for workspace routing.
3. Read this file.
4. Read `docs/README.md`.
5. Read `docs/rules/project.md` for merged service and frontend development rules.
6. Read `docs/rules/api.md` for API/DTO/response work.
7. Read `docs/rules/database.md` for entity/query/schema assumptions.
8. Read `docs/rules/testing.md` when changing behavior.
9. For legacy assistant compatibility, read `.aiassistant/rules/README.md`.

## Scope

- Stack: NestJS, TypeScript, TypeORM, MySQL, React, Vite, and SCSS.
- Primary source roots: `src/` for API runtime and `frontend/src/` for the embedded web client.
- Service owns controllers, DTOs, validation, services, repositories, API contracts, and frontend route/service integration.
- Service-specific detailed rules live in `docs/rules/project.md`.

## Implementation Rules

- Keep controllers thin and delegate domain logic to services.
- Validate request payloads and query params explicitly.
- Keep response shapes stable for `frontend/src/services` consumers.
- Do not introduce a global response envelope without migrating frontend consumers.
- Route frontend API calls through `frontend/src/services` when a service exists.
- Keep page components focused on composition and presentation.
- Keep side effects in hooks or `useEffect`, not inline render branches.
- Coordinate table, column, and partition assumptions with `crawler/`.
- Never expose env values, tokens, or secrets in logs or responses.

## Validation

- Production check: `npm run build`.
- API tests when relevant: `npm run test`.
- API dev server when needed: `npm run start:dev`.
- Frontend dev server when needed: `npm run frontend:dev`.
- For docs-only changes, file presence and readable Markdown checks are enough.
