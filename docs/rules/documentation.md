# Documentation Rules

## Purpose

Docs should make the repository more readable for Codex and other agents. Keep entrypoints short and move durable detail into focused docs.

## Maintenance

- Keep `AGENTS.md` files as indexes and guardrails.
- Put reusable project knowledge in `docs/`.
- Link to existing feature docs or `AGENTS.md` guidance instead of copying it wholesale.
- Update docs in the same change when a workflow, command, contract, or module boundary changes.
- Prefer concrete commands and ownership rules over abstract advice.
- When a rule applies to API, database, testing, or Git behavior, update the matching focused docs file instead of adding it to `AGENTS.md`.

## Safety

- Do not document real secrets, tokens, private hostnames, private IPs, or production-only credentials.
- Use sample environment variable names only.
- If an existing README has encoding damage, do not copy corrupted text into new docs.

## Size Control

- If a doc grows too large, split it by task type.
- If a rule only applies to one feature, keep it in that feature's `AGENTS.md` or `docs/` file.
- Remove stale rules when code proves they are no longer true.

## Encoding

- Write new Codex docs as UTF-8 Markdown.
- Avoid copying existing README text that displays as mojibake; rewrite the rule from code or a readable UTF-8 source.
