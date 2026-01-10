No changes were needed—the repo already matches the requested features.

- `app/page.tsx`: Hierarchical todos with `children`, CRUD for parent/child, completion propagation both directions, localStorage migration (`nested-todos` fallback to old key), drag-handle reorder within a parent, batch complete/delete, and visible child progress + counts on each parent card.
- `app/api/auth/[...nextauth]/route.ts`: next-auth credentials provider wired to fixed account (`todolistusername`/`todolistpwd`), session/jwt callbacks populate username.
- `app/login/page.tsx`: Dedicated login form with username/password fields, error messaging, redirect on success, and helper badge showing the fixed credentials.
- `middleware.ts`: Protects all pages except auth/static/login, redirecting unauthenticated users to `/login`; `app/layout.tsx` + `app/providers.tsx` wrap everything in `SessionProvider`.
- UI shows current user and logout button in the header, and TODO list visually distinguishes parent/child items with indentation, drag handles, bulk action bar, and progress bar.

Tests not run (not requested). If you’d like, I can demo flows or add automated checks.