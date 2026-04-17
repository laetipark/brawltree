# Service Testing Rules

## Priorities

- Prefer tests for API response shape, filter normalization, query mapping, cache keys/TTLs, and frontend service compatibility.
- For API changes, test service behavior first; add controller tests when response shaping or exception behavior matters.
- For frontend changes, prioritize build validation plus hook/service behavior that protects user-facing routes.
- Do not depend on live upstream APIs or private local env values.

## Minimum Scenarios

- API response changes cover the matching route or service method and frontend service type.
- Battle stats/logs changes cover `type`, `mode`, season window, and `stack`.
- Cache changes cover hit, expiry, key parameters, and bounded cleanup.
- Refactors keep at least one smoke check around the changed path when useful coverage exists.

## Style

- Each test should make one rule obvious.
- Prefer fixed fixtures over live network calls.
- Mock repositories and services instead of requiring MySQL for unit tests.
- Keep e2e tests separate unless the task is specifically e2e-focused.
