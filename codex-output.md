**Changes**
- Added tree helpers in `app/page.tsx` to support child todo drag reordering plus batch complete/delete while keeping completion reconciliation intact for parents and descendants.
- Reworked todo cards to surface child progress (counts and bar), show login identity, and preserve nested CRUD; parents now expose selection controls and batch buttons with selection cleanup when children change.
- Introduced draggable handles and selection checkboxes alongside each child todo so order changes persist to storage and bulk actions are easily discoverable.

- Tests: Not run (not requested)

Next steps: 1) Run `pnpm lint:check` to ensure type/lint coverage. 2) Manually verify drag-sorting and batch operations on multiple nesting levels in the browser.