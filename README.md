# AI 监督 AI 的工作流（中文说明）

本仓库采用「Codex 产出代码 → Gemini 审计 → 再由 Codex 修复」的闭环，确保产品功能持续被 AI 监督与纠错。

## 工作流总览

1) 主动 push 到 `codex/*` 分支
   - 触发 `.`github/workflows/codex-auto-pr.yml` 自动创建 PR
2) PR 创建或更新
   - 触发 `.`github/workflows/gemini-audit.yml` 进行审计
   - Gemini 审计规则位于 `.`github/ai-review-rubric.md`
3) 如果审计需要代码改动
   - 审计评论首行必须包含：`@codex address this feedback`
   - 触发 `.`github/workflows/codex-task.yml`，Codex 会读取仓库根目录的 `task.md`，并结合评论内容执行修复
4) Codex 修复后 push 到原 PR 分支
   - PR 自动更新，Gemini 重新审计
5) 重复 3-4 步，直到审计通过

## 关键文件

- `.`github/workflows/codex-auto-pr.yml`：监听 `codex/*` 分支 push，自动创建 PR
- `.`github/workflows/gemini-audit.yml`：PR 审计与评论
- `.`github/workflows/codex-task.yml`：PR 评论 `@codex` 触发 Codex 修复
- `.`github/ai-review-rubric.md`：审计规则（含 `@codex` 触发约束）
- `task.md`：Codex 执行任务的主说明（必须存在）

## 使用前置条件

- GitHub Secrets 配置：`OPENAI_API_KEY`、`GEMINI_API_KEY`
- `task.md` 写清楚当前要实现/修复的任务目标
