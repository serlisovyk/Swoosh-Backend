# Plan: bun everywhere in docs, pin Node in .nvmrc

Issue: MY-72 · No spec — internal tooling/docs change, no observable behavior or contract change.

## Context

`bun.lock` is the only committed lockfile — bun is the actual package manager. `README.md`, `AGENTS.md`, `CLAUDE.md` still say `npm install`/`npm run ...`. Node version is pinned nowhere.

## Commit breakdown

1. **docs(ai): plan for bun-everywhere docs switch** — this commit, plan only, no code.
2. **docs: switch npm references to bun, pin Node version**
   - `README.md`: `npm install` → `bun install`, `npm run start:dev` → `bun run start:dev`, `npm run lint`/`npm run build` → `bun run lint`/`bun run build`.
   - `AGENTS.md`: the two `npm run` mentions (Workflow section, Verification section) → `bun run`.
   - `CLAUDE.md`: the one `npm run lint`/`npm run build` mention → `bun run`.
   - `ai/rules/definition-of-done.md`: the two literal `npm run` lines → `bun run`.
   - `package.json`: add `"packageManager": "bun@1.3.6"`.
   - `.nvmrc`: add, content `24`.
   - Scripts inside `package.json` stay as-is — they are shell commands, not npm-specific; only what invokes them in docs changes.

## Explicitly not touched (out of scope per issue)

- `ai/workflow.md`, `ai/task-prompt-template.md`, `ai/linear-task-template.md`, `ai/skills/*`, `ai/decisions/*`, `ai/rules/code-conventions.md`, and historical `ai/superpowers/plans/*.md` files — not named in the issue's "must check and update" list; each `npm run` mention there is either a historical record (past commits/plans, correct at the time they were written) or outside the enumerated scope.
- CI, Dependabot, `.vscode/settings.json`, `engines` in `package.json`, throttler trust-proxy — explicitly out of scope in the issue.

## Verification

- `bun install` — must produce no diff in `bun.lock`.
- `bun run lint`
- `bun run build`
