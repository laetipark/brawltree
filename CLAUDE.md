# Service Agent Entry

Use this file for agent work inside `service/`. Keep it short: this is a routing map, not the full service rulebook.

## Read Order

1. Read this file.
2. Read `docs/README.md`; it is the service work harness and the source of truth for detailed doc selection.
3. Choose the smallest matching task route in `docs/README.md`.
4. Read only the detailed docs selected by that harness.

## Entrypoint Boundary

- This file is the local entrypoint for `service/`.
- Do not route generic agent work through `CLAUDE.md`; use this file and the service harness.

## Harness Contract

- Do not use this file as the only rule source for implementation, API, database, frontend, validation, or docs work.
- For `CLAUDE.md`, `AGENTS.md`, or harness routing changes, follow the entrypoint route in `docs/README.md`.
- When adding, removing, or renaming service docs, update `docs/README.md` in the same change.
- Keep durable detailed rules in `docs/` rather than expanding this entry file.

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
