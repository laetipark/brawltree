# Service Harness Rules

Use these rules when changing service agent docs or workflows.

## Principles

- Keep entry files map-like and short.
- Use `docs/README.md` for routing and focused `docs/rules/*` files for durable rules.
- Read only the docs needed for the current task.
- Prefer locally inspectable code patterns over chat-only knowledge.

## Work Loop

1. Read the nearest entry file and relevant docs.
2. Inspect code before choosing an implementation.
3. Make scoped changes.
4. Run the narrowest useful validation.
5. Move repeated lessons into docs.

## Repository Criteria

- Module ownership and runtime roles should be explicit.
- Env/config should hold dynamic operational values.
- Query, cache, and API behavior should have clear names and contracts.
- Logs should help debug without leaking secrets.
