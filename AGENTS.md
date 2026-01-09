# Agent Workflow Instructions

These instructions apply to all files in this repository.

## Required workflow
- Always pull the latest `main` before committing: `git pull --rebase origin main`.
- Stage all changes: `git add .`
- Commit with the exact message: `git commit -m "Auto-update by Codex"`
- Push to the `main` branch: `git push origin main`
- After a successful commit, create a pull request using the `make_pr` tool.

## Pull request template
Use the following structure when creating the PR:

```
## Summary
- <summary bullet>

## Testing
- Not run (not requested)
```

## Remote setup checklist (Codex)
If `origin` is missing or Git operations fail, configure the remote and user details:

```bash
git remote -v
git remote add origin <your-repository-url> # e.g. git@github.com:hh-cheng/agent-test.git
git remote set-url origin https://github.com/hh-cheng/agent-test.git
git remote -v
git config --global user.name "Your Name"
git config --global user.email "your-email@example.com"
git checkout -b main
```

Then sync and push:

```bash
git pull --rebase origin main
git push origin main
```
