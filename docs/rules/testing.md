# Service Testing Rules

## Priorities

- Prefer tests around durable rules: API response shape, filter normalization, query mapping, cache key/TTL behavior, partition behavior, and frontend service compatibility.
- For API changes, test service-level behavior first and controller behavior only where response shaping or exception behavior matters.
- For frontend changes, prioritize build validation and hook/service behavior that protects user-facing routes.
- Do not depend on live upstream APIs or private local env values.

## Minimum Scenarios

- API response changes must cover the matching route or service method and the frontend service type.
- Battle stats/logs changes must cover `type`, `mode`, season window, and stack behavior.
- Cache changes must cover cache hit, expiry, key parameters, and bounded cleanup.
- Refactors should include at least one smoke test when the default test command previously had no useful coverage.

## Test Style

- Each test should make one rule obvious.
- Prefer fixed fixtures over live network calls.
- Mock repositories and services instead of requiring MySQL for unit tests.
- Keep e2e tests separate from the default unit-smoke baseline unless the task is specifically e2e-focused.
