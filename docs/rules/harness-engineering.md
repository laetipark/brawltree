# Service Harness Rules

Use these rules when changing service agent docs or workflows.

## Principles

- Keep entry files map-like and short.
- Use `docs/README.md` for routing and focused `docs/rules/*` files for durable rules.
- Read only the docs needed for the current task.
- Prefer locally inspectable code patterns over chat-only knowledge.

## Work Loop

1. Read the active feature entrypoint and relevant docs.
2. Inspect code before choosing an implementation.
3. Make scoped changes.
4. Run the narrowest useful validation.
5. Move repeated lessons into docs.

## Harness Criteria

- Task routes should name the smallest useful doc set.
- Document maps should describe file roles, not repeat detailed rules.
- Entry files should point into the harness, not compete with it.
