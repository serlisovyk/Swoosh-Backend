# Task Workflow

End-to-end sequence for taking a backend task. `AGENTS.md` states the non-negotiable rule (spec + plan committed before code); this file is the full flow.

## 1. Pick up the task

- Read the Linear issue (`MY-<n>`) in full, including its checklists.
- Check `ai/decisions/` for anything the task would contradict. If it reverses a decision, say so before starting.
- If the scope is ambiguous or the task conflicts with a rule, ask **before** writing anything.

## 2. Branch

- Branch off `main` using the branch name Linear already provides for the issue (`gitBranchName`, e.g. `serlesovik/my-39-<slug>`).
- Never commit backend work directly on `main`.

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

- what changed and why, with the commit list;
- verification output (`lint` / `build`);
- review findings and what was done about each;
- anything deliberately left out of scope.

Then stop and wait. Silence, a neutral reply, or a question is not approval — only an explicit yes is. If changes are requested, apply them and return to step 8.

## 12. Report on the task

Comment on the Linear issue: short SHAs plus what landed. Move the state to `In Review` or `Done` per the author's instruction.

## 13. Merge

Merge the branch into `main` only after step 11 approval.

## Rules that never bend

- Backend only — never touch or reason about the frontend.
- Never work directly on `main`.
- Never skip the spec + plan commit for a behavior or contract change.
- Never merge or close without explicit author approval.
- Never add tests unless explicitly asked.
