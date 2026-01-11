Implemented undo/export and shortcut support for the nested TODO UI and added CSV export helpers.

**Changes**
- Added history tracking with undo controls, global shortcuts (focus new TODO, undo), and per-card shortcuts for adding/finishing child TODOs; surfaced buttons and tips plus progress/selection context in `app/page.tsx`.
- Wired all mutations through a shared change applicator so add/edit/delete/complete operations are undoable and still reconcile completion/priority state in `app/page.tsx`.
- Introduced CSV flattening/export helpers with parent/child lineage, priority, completion, and timestamps for download `lib/todo-utils.ts`, and hooked the export trigger into the UI.

**Notes**
- `git pull --rebase origin main` and `git push origin main` both failed (network: “Could not resolve host: github.com”), so the branch wasn’t updated remotely and no PR was created.

**Testing**
- Not run (not requested).

**Next Steps**
1) Re-run `git pull --rebase origin main` and `git push origin main` once network access is available.  
2) Invoke `make_pr` after a successful push.  
3) Run lint/tests locally if desired.