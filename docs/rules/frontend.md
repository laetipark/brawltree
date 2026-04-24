# Service Frontend Rules

Use this file for frontend routes, pages, hooks, service-layer calls, config, UI state, presentation, and SCSS work under `frontend/src/`.

## Ownership

- `frontend/src/` owns route composition, UI state, hooks, contexts, presentation, and same-origin API usage.
- `frontend/src/services` owns frontend API calls and service-specific response types.
- `frontend/src/common/config/config.ts` owns API base URL and CDN constants.
- Frontend code must not depend on crawler table, partition, ingestion, or worker implementation details.

## API Usage

- Route frontend calls through `frontend/src/services` when a service exists.
- UI components should not construct API URLs directly unless no service layer exists yet.
- Keep API response type changes aligned with backend DTO/service behavior and callers.
- Preserve proxy-backed paths `/cdn`, `/youtube`, and `/inbox` unless consumer code changes in the same task.

## Components And Hooks

- Keep pages focused on composition and presentation.
- Move loading, retry, derived state, and side effects into hooks or `useEffect`.
- Keep side effects out of inline render branches.
- Split large frontend containers by responsibility: route params, data loading, menu state, SEO data, and context values.

## Styling

- Reuse existing component and SCSS module patterns before introducing new UI patterns.
- Keep user-facing route behavior stable unless the task explicitly changes it.
