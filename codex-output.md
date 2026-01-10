Changes:
- Moved todo types and helpers into `lib/todo-utils.ts`, keeping storage normalization, batch operations, sorting, and the new `filterChildren` helper reused by the UI.
- Updated `app/page.tsx` to memoize filtered child lists, clear selections only on filter changes or clearing the search box, and keep all interactions wired to the shared helpers for consistent parent/child completion and priority handling.
- Added runnable unit-test setup (`tsconfig.test.json`, `package.json` test script, `.gitignore` for `.tmp-test/`) plus `tests/todo-utils.test.ts` covering priority batch updates (success and edge cases) and combined filter/search behavior.

Testing:
- Not run (`node_modules` are not installed in this workspace).

Next steps:
1) Install dependencies then run `npm test` (or `pnpm test`) to compile with `tsconfig.test.json` and execute the new node-based tests.
2) If everything looks good, commit and push per the repo’s workflow.