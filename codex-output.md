Implemented the requested fixes and coverage additions. Updates include:
- Stabilized TodoItem keyboard handlers via `useCallback` plus refs to avoid unnecessary re-binding, keeping shortcuts intact in `app/page.tsx`.
- Swapped the audit workflow to use the default GitHub token (`.github/workflows/gemini-audit.yml`), removing the custom PAT risk.
- Added CSV/flattening edge-case tests (empty, single-level, nested, special characters) in `tests/todo-utils.test.ts`.

Tests: `pnpm test` (fails here because pnpm/dependencies aren’t available in this environment).

Note: Optional suggestions from the audit (undo persistence/redo, consolidating keyboard listeners) are not implemented in this pass.
Everything you asked for is already implemented in the current codebase:

- Nested TODO data with priority: `lib/todo-utils.ts` normalizes legacy data, adds `priority`, handles deep completion/reconciliation, batch completion/deletion/priority, filtering, and drag reordering; `app/page.tsx` renders parent/child hierarchy with indenting, progress, inline priority controls, search/filter, batch actions, and drag handles per parent.
- Auth flow: `app/api/auth/[...nextauth]/route.ts` sets up `next-auth` credentials with the fixed `todolistusername`/`todolistpwd`, maps username into the session, and points sign-in to `/login`; `middleware.ts` protects all core pages and redirects unauthenticated visitors; `app/login/page.tsx` provides the login form with error handling; session display + logout live on the main page header in `app/page.tsx`.
- Persistence and migration: `app/page.tsx` reads old `todos` data, normalizes it, and stores to `nested-todos`, preserving ordering and progress stats.

No code changes were needed; I didn’t run tests (not requested). If you want adjustments or further refinements, let me know.
