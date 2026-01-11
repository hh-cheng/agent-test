No code changes were needed—the current codebase already implements the requested features end to end.

- Nested TODOs with child CRUD, priority, filters/search, bulk actions, drag sorting, progress, CSV export, undo history, and shortcuts are all handled in `app/page.tsx` with supporting logic in `lib/todo-utils.ts`.
- Fixed-credential login via next-auth is set up in `app/api/auth/[...nextauth]/route.ts`, protected by `middleware.ts`, with a full login UI/validation flow in `app/login/page.tsx` and session wiring in `app/providers.tsx`.
- UI shows parent/child hierarchy, progress, priority badges, batch controls, export/undo buttons, and shortcut hints; login status and sign-out are surfaced in the header on `app/page.tsx`.

If you want additional tweaks or tests for these flows, I can add them.