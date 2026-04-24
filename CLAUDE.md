# Service Claude Entry

Use this file for Claude work inside `service/`. Keep it short: this is a routing map, not the full service rulebook.

## Read Order

1. Read this file.
2. Read `docs/README.md`; it is the service work harness and the source of truth for detailed doc selection.
3. Choose the smallest matching task route in `docs/README.md`.
4. Read only the detailed docs selected by that harness.

## Entrypoint Boundary

- Do not read parent workspace entrypoints for normal service-scoped Claude work.
- Do not route Claude work through `AGENTS.md`; use this file and the service harness.

## Scope

- Stack: NestJS, TypeScript, TypeORM, MySQL, React, Vite, and SCSS.
- Primary source roots: `src/` for API runtime and `frontend/src/` for the embedded web client.
- Service owns controllers, DTOs, validation, services, repositories, API contracts, and frontend route/service integration.
- Service-specific detailed rules are selected through `docs/README.md`.

## Response Language

- Answer the user in Korean for all user-facing responses, unless the user explicitly asks for another language.

## Safety

- Never expose env values, tokens, secrets, private hosts, or private IPs in docs, logs, responses, or code.
- Keep deployment-only values in env/config.
- Coordinate cross-feature contracts through the detailed docs selected by `docs/README.md`.

## Validation

- Use `docs/README.md` and `docs/rules/validation.md` to choose the narrowest useful validation.
- For docs-only changes, file presence and readable Markdown checks are enough.
