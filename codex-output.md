**Changes**
- Expanded todo model in `app/page.tsx` to include a persisted `priority` field with safe normalization/defaults for existing local data.
- Added per-item priority badges and quick selectors (including children), keeping parent/child completion logic intact while allowing single and batch priority updates.
- Introduced child-level filters (all/未完成/已完成), search, and enhanced batch controls (complete/delete/priority) with visibility counts and updated selection behavior.
- Refined child list rendering to respect filter/search results and communicate empty states while preserving drag-to-reorder and progress visuals.

**Testing**
- Not run (not requested).