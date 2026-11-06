# Agents

## Toast

Reusable toast component for brief UI feedback.

Usage:
- Import: `import Toast from "./Toast/Toast";`
- Render: `<Toast message="Copied to clipboard" visible={isVisible} />`
- Optional props: `role` ("status" | "alert") and `ariaLive` ("polite" | "assertive") for accessibility.

Notes:
- Position and animation are controlled by `src/components/Toast/Toast.module.css`.
- Visibility is controlled by the `visible` prop; toggle it in state and use a timeout to auto-hide.


## Cross-device Sync Plan (Agreed)

Goal:
- Support sync across devices for reading progress and highlights, while keeping `BokReader` reusable and backend-agnostic.

Core architecture:
- `BokReader` remains local-first and does not own auth/networking.
- Host app owns sync button, sync notifications/toasts, backend calls, retries, and conflict UI.
- Reader exposes headless sync integration points (event callbacks + controlled sync state + ref commands).

v1 scope:
- Sync entities: progress and highlights.
- Conflict policy: manual conflict prompts (rendered by host app).
- Local persistence compatibility: keep localStorage fallback by default.

Data identity:
- Use stable `bookId` derived from OPF metadata hash (identifier-first fallback to canonical metadata fields).
- Do not use filename/title as the long-term storage identity.
- Migrate legacy title-keyed localStorage data into hash-keyed storage one time when needed.

Suggested reader integration surface:
- `onSyncEvent(event)` for semantic patch events.
- `syncState` prop for host-provided hydrated state.
- `onConflictDetected(conflict)` callback for manual resolution workflow.
- Ref methods for snapshot/apply/ack operations as sync evolves.

Suggested backend contract (custom API + DB):
- `POST /v1/sync/events` with idempotent mutation IDs.
- `GET /v1/sync/state?bookId=...` for hydration/pull.
- `POST /v1/sync/resolve-conflict` for manual conflict outcomes.

Host responsibilities:
- Authenticate user/session.
- Queue and submit emitted events.
- Pull remote state on app open/book open/focus/manual sync.
- Present conflict modal and apply chosen resolution.


## Performance notes (0.8.14)

Measured in headless Chromium with 4x CPU throttling, phone viewport.

- `.book-page` has `contain: strict`. Without it, any repaint on the page makes the browser walk every column fragment of the book.
- The cube overlay is hidden with `opacity`, not `visibility` (inherited, so toggling it restyled and repainted both copies of the book on every turn).
- A book is laid out once on open: the page size is measured before the HTML goes in, the settings are inline on the book element, the book's fonts load first, and the EPUB stylesheet is a `<style>` (a blob `<link>` loaded late and caused a second layout).
- The loading spinner only animates `transform`, so it runs on the compositor while the book loads.

Known, not fixed yet:
- Relayout after a settings change (e.g. font size) is about 20% slower than in 0.8.13 (about 3.4 s vs 2.9 s on Pride and Prejudice at 4x). Not caused by `contain` or the font preloading; cause unknown.
- Adding a highlight freezes the page (about 0.7 s, or about 10 s in cube mode, where the whole book is cloned twice again). Pre-existing: every change unwraps and rewraps all highlights.
- Very long books (War and Peace) are still slow: scrolling the book costs time proportional to its length on every frame.
