- Existing code already delivers the requested nested TODO features: parent/child CRUD, completion rules, drag-sort, batch complete/delete, priority batch updates, filters/search, and progress display in `app/page.tsx` with supporting logic in `lib/todo-utils.ts` (includes safe normalization of legacy data/localStorage).
- NextAuth credential login (username `todolistusername`, password `todolistpwd`) is wired via `app/api/auth/[...nextauth]/route.ts` and protected by `middleware.ts`, with session wiring in `app/layout.tsx` and a full login UI in `app/login/page.tsx`; header shows logged-in user and sign-out.

Testing:
- Not run (`pnpm` command not available in this environment).