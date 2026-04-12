# Service Git Rules

## Repository Shape

- `D:\BrawlTree\service` is a Git repository.
- `frontend/` is part of the same repository.
- Check `git status --short` before editing or reporting changed files.
- Keep unrelated user changes intact.

## Commit Message Rules

- When asked to create a commit message for this repository, output one Korean line only.
- Format is `type : content`.
- Keep the full line within 50 characters when possible.
- When IntelliJ is opened at `D:\BrawlTree`, changes under `service/**` still belong to this repository.
- For AI Assistant commit-message generation, output the raw commit message only: no Markdown, no quotes, no explanation, and no English conventional-commit prefix such as `fix:`.
