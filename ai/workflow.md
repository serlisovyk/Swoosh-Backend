# Task Workflow

End-to-end sequence for taking a backend task. `AGENTS.md` states the non-negotiable rule (spec + plan committed before code); this file is the full flow.

## 1. Pick up the task

- Read the Linear issue (`MY-<n>`) in full, including its checklists.
- Check `ai/decisions/` for anything the task would contradict. If it reverses a decision, say so before starting.
- If the scope is ambiguous or the task conflicts with a rule, ask **before** writing anything.

## 2. Branch

- Branch off `main`, named `<issue-id>-<slug>` (e.g. `my-39-error-envelope`) — lowercase issue id, short English slug, no username prefix.
- Linear's `gitBranchName` derives the slug from the issue title, which is often in Russian — this can produce a transliterated, non-English slug (Russian words spelled with Latin letters), and it prepends a username. Never use `gitBranchName` as-is: drop any username prefix, and if the slug isn't made of real English words, replace it with a short English slug you write yourself (e.g. `my-39-error-envelope`, not `serlesovik/my-39-privesti-oshibki-k-envelope`).
- Never commit backend work directly on `main`.
- Working on several issues at once: use a separate `git worktree` per issue (see "Parallel work" below) instead of stashing between branches in one working copy.

## 3. Move the task to In Progress

Set the Linear issue state to `In Progress` when work actually starts — not when it is merely planned.

## 4. Orient

Read in this order, stopping once you have what the task needs:

1. `ai/map.md` — where things live, and what the project deliberately lacks.
2. The applicable `ai/rules/*` (architecture, auth-and-api-contracts, code-conventions).
3. The matching skill(s) in `ai/skills/` — `module`, `mongoose-models`, `query-filters`, `swagger-docs`, `auth-flow`.

Do not explore `src/` from scratch when the map answers the question.

## 5. Spec + plan — one commit, before code

- **Plan** — always. **Spec** — only when the task changes observable behavior or a public/data contract.
- Write them under `ai/superpowers/plans/` and `ai/superpowers/specs/` as `<YYYY-MM-DD>-<slug>.md`, reusing the issue's slug so spec, plan, branch, and issue all pair up.
- Write spec and plan **in English**, always — same as code, comments, and commits. This holds even when the Linear issue is in Russian and the chat with the author is in Russian; only chat replies follow the author's language, never files committed to the repo.
- Format is yours to choose; keep it concise and specific. The plan must contain the intended commit breakdown.
- Commit spec + plan together as a **single commit**, before any implementation commit.

## 6. Implement

- Follow the plan's commit breakdown; commit in milestones, not one giant snapshot.
- Use the matching skill for each step rather than improvising a pattern.
- If reality diverges from the plan, update the plan in the same branch — do not silently drift.

## 7. Keep docs in the same change

- Swagger `*.swagger.ts` for any request/response or auth-marker change.
- `README.md` when setup, scripts, or env changed.
- `ai/rules/*` or `ai/skills/*` when the change reshaped a pattern.
- `ai/map.md` when a module, cross-cutting package, or entry file was added, removed, or renamed.
- `ai/decisions/` — a new dated record when the change settled or reversed a durable decision.

## 8. Verify

- `npm run lint`.
- `npm run build` — after deleting files, changing dependencies, or changing public contracts.
- No test suite exists. Do not add tests, and do not report their absence as a gap.

## 9. Definition of Done gate

Walk `ai/rules/definition-of-done.md` point by point. Fix what fails before moving on.

## 10. Self-review

- Run the `review` skill over the diff.
- Add `security-review` when the change touches auth, validation, secrets, or data exposure.
- Add `performance-review` when it touches query paths, indexes, or payload size.
- Fix what you find, or state plainly why a finding is being left alone.

## 11. Author approval — required stop

**Nothing merges and nothing is marked done without the repo author's explicit approval.**

Hand over a short summary:

- **what was done** — a short plain-language bullet list of the actual changes, point by point, written so the author can follow it without opening the issue, the diff, or the plan (e.g. "moved refresh-token expiry read to `getOrThrow`", "removed the dead `logout()` method", not "fixed auth per the plan");
- the commit list, each with what it does;
- verification output (`lint` / `build`);
- review findings and what was done about each;
- anything deliberately left out of scope.

Then stop and wait. Silence, a neutral reply, or a question is not approval — only an explicit yes is. If changes are requested, apply them and return to step 8.

## 12. Report on the task

Comment on the Linear issue: short SHAs plus what landed. Move the state to `In Review` or `Done` per the author's instruction.

## 13. Merge

Merge the branch into `main` only after step 11 approval.

## Parallel work (worktrees)

Running several issues at once means several agent sessions, each in its own `git worktree`, each on its own branch. This is an execution detail — every step above (spec+plan commit, docs, verify, DoD, self-review, author approval) still applies per issue, unchanged. Start each session with `ai/task-prompt-template.md`, filled in with just the issue number — the session sets up its own worktree and branch.

### Setup

- One worktree per issue, off `main`, named after the branch: `git worktree add ../swoosh-my-<n> my-<n>-<slug>` (see step 2 for the branch-name rule).
- Each worktree needs its own `.env` (copy, don't symlink) and its own `node_modules`/install — they do not share a dev server or port.
- Give each session only its own issue number. It must not read or touch other in-flight worktrees.

### Picking a batch that parallelizes well

- Prefer issues whose primary files don't overlap (different module folders, or module vs. `common`/`shared`). Two issues editing the same file is not forbidden, just extra merge work later — pick around it when a same-or-lower-priority alternative exists.
- Never batch a foundational task with the tasks that depend on it (e.g. a shared-helper extraction with the per-module cleanup that will use it). Sequence those instead: land the foundation, then branch the dependents from the updated `main`.
- Never batch a repo-wide gate or config change (anything touching `tsconfig.json`, `eslint.config.mjs`, or another file every other change must pass through) alongside content-heavy branches — it invites conflicts in every other worktree and should land alone, merged before or after the batch.

### Merging back

- Merge one worktree's branch into `main` at a time, each only after its own step 11 author approval.
- After each merge, rebase the still-open worktrees onto the new `main` before continuing — don't let them drift for the whole batch.
- Remove a worktree once its branch is merged: `git worktree remove ../swoosh-my-<n>`.

## Rules that never bend

- Backend only — never touch or reason about the frontend.
- Never work directly on `main`.
- Never skip the spec + plan commit for a behavior or contract change.
- Never merge or close without explicit author approval.
- Never add tests unless explicitly asked.
