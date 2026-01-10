**Changes**
- Replaced `app/page.tsx` with a client-side nested TODO experience: parent/child CRUD, inline editing, completion propagation (parent toggles cascade to children; all children complete auto-finishes parent), localStorage migration-safe normalization, and clear hierarchy styling with creation timestamps and per-item child adders.
- Added NextAuth credentials auth (`app/api/auth/[...nextauth]/route.ts`, `middleware.ts`, `app/providers.tsx`), protecting all core pages, surfacing session info plus sign-out in the TODO header, and redirecting unauthenticated users to login.
- Built a dedicated `/login` page (`app/login/page.tsx`) with username/password fields, fixed credentials, loading/error states, and visual guidance; updated layout metadata for the authenticated app.
- Declared `next-auth` dependency in `package.json` for the new auth flow.

**Notes**
- Lockfile not updated here; run `pnpm install` to refresh `pnpm-lock.yaml` after the dependency change.
- Tests not run (not requested).