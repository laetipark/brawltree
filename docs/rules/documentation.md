# Service Documentation Rules

## Purpose

Service docs should preserve durable project knowledge without turning entry files into manuals.

## Maintenance

- Keep `AGENTS.md` and `.aiassistant/rules/README.md` short.
- Put reusable service knowledge in focused `docs/` pages.
- Update docs when a workflow, command, API contract, schema assumption, or module boundary changes.
- Put API, database, testing, and validation rules in their matching files.
- Link to existing docs instead of copying long guidance.

## Safety

- Do not document real secrets, tokens, private hostnames, private IPs, or production-only credentials.
- Use sample env variable names only.
- Write new docs as UTF-8 Markdown.
- Do not copy mojibake; rewrite from readable sources.
