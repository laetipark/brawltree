# Harness Engineering Rules

Use this workspace as an agent-readable system, not as a pile of ad hoc notes.

## Core Principles

- Keep entry files short and map-like.
- Put durable decision rules in focused `docs/` files.
- Read only the documents needed for the current task.
- Update docs when a workflow, contract, or module boundary changes.
- Prefer code patterns that an agent can inspect and verify locally.

## Work Loop

1. Read the nearest `AGENTS.md` and the relevant docs files.
2. Inspect the current code before deciding the implementation shape.
3. Make small scoped changes.
4. Run the narrowest meaningful validation.
5. Record durable lessons in docs rather than leaving them only in chat.

## Agent-Friendly Repository Criteria

- Module ownership must be explicit.
- Runtime roles must be named and documented.
- Dynamic operational values should remain in env/config, not hidden as unexplained constants.
- Query, cache, and worker behavior should have clear key/role/TTL naming.
- Errors and logs should expose enough local context to debug without leaking secrets.
