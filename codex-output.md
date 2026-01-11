Implemented the requested fixes and coverage additions. Updates include:
- Stabilized TodoItem keyboard handlers via `useCallback` plus refs to avoid unnecessary re-binding, keeping shortcuts intact in `app/page.tsx`.
- Swapped the audit workflow to use the default GitHub token (`.github/workflows/gemini-audit.yml`), removing the custom PAT risk.
- Added CSV/flattening edge-case tests (empty, single-level, nested, special characters) in `tests/todo-utils.test.ts`.

Tests: `pnpm test` (fails here because pnpm/dependencies aren’t available in this environment).

Note: Optional suggestions from the audit (undo persistence/redo, consolidating keyboard listeners) are not implemented in this pass.