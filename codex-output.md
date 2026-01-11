Changes:
- Moved todo types and helpers into `lib/todo-utils.ts`, keeping storage normalization, batch operations, sorting, and the new `filterChildren` helper reused by the UI.
- Updated `app/page.tsx` to memoize filtered child lists, clear selections only on filter changes or clearing the search box, and keep all interactions wired to the shared helpers for consistent parent/child completion and priority handling.
- Added runnable unit-test setup (`tsconfig.test.json`, `package.json` test script, `.gitignore` for `.tmp-test/`) plus `tests/todo-utils.test.ts` covering priority batch updates (success and edge cases) and combined filter/search behavior.

Testing:
- Not run (`node_modules` are not installed in this workspace).

Next steps:
1) Install dependencies then run `npm test` (or `pnpm test`) to compile with `tsconfig.test.json` and execute the new node-based tests.
2) If everything looks good, commit and push per the repo’s workflow.
现有代码已覆盖你的需求，无需再改动。关键实现位置：
- 嵌套 TODO 结构与子项 CRUD、批量操作、拖拽排序、进度展示已在 `app/page.tsx` 完成；包含递归 `Todo` 结构、`reconcileTree` 完成状态同步、批量完成/删除与拖拽重排逻辑以及父级进度条与层级缩进展示。
- next-auth 已接入：`app/api/auth/[...nextauth]/route.ts` 定义了固定账号密码登录和会话字段；`app/login/page.tsx` 提供登录表单与错误提示；`middleware.ts` 保护除 `/login` 与 auth 之外的页面并引导未登录用户；`app/layout.tsx` 与 `app/providers.tsx` 包裹 `SessionProvider`，主页 `app/page.tsx` 显示当前用户并支持登出。

测试：未运行（未请求）。

你可以直接 `pnpm dev` 体验登录与嵌套 TODO 功能。
