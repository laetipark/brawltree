# Service Git Rules

## Repository

- `./` is the service Git repository.
- `frontend/` is part of the same repository.
- When IntelliJ is opened at the workspace root, changes under `service/**` still belong here.
- Check `git status --short` before reporting changed files.
- Keep unrelated user changes intact.

## Commit Messages

- Output one Korean line only.
- Format: `type : content`.
- `type` must be one of: `feat`, `update`, `fix`, `docs`, `design`, `style`, `rename`, `delete`, `refactor`, `test`, `chore`.
- `content` must be natural Korean that summarizes the actual change.
- Keep technical names, paths, commands, package names, and API identifiers in English only when needed.
- Keep the line within 50 characters when possible.
- Do not add Markdown, quotes, code fences, bullets, explanations, prefixes, suffixes, or commit bodies.
- Do not use conventional-commit format such as `fix: ...`.

## Examples

- Correct: `fix : 사용자 검색 응답 누락 보정`
- Correct: `docs : Git 규칙 한글 출력 기준 정리`
- Incorrect: `fix: 사용자 검색 응답 누락 보정`
- Incorrect: `fix : adjust user search response`
