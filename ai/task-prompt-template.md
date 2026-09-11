# Task session prompt template

Fill in `{ISSUE}` and send it as the session's first message. Nothing else to fill in — the agent works out and creates the branch and worktree itself.

---

Pick up Linear issue **{ISSUE}**.

First, set up the environment:

- Fetch the issue from Linear, get its `gitBranchName`.
- Create a worktree next to the current repo, named after the issue (e.g. `../swoosh-{issue-lowercased}`), on branch `gitBranchName`, off latest `main`: `git worktree add <path> <branch>`.
- Copy `.env` into the worktree (not a symlink), install dependencies there.
- Do all further work inside that worktree, not in the original repo copy.

Then follow `ai/workflow.md` end to end for this issue: read `AGENTS.md`, orient via `ai/map.md` and the relevant `ai/rules/*` + `ai/skills/*`, move the issue to `In Progress`, write spec+plan under `ai/superpowers/` and commit them together in a single commit before any code, implement per the plan's commit breakdown, update docs in the same change, verify with `npm run lint` / `npm run build`, walk `ai/rules/definition-of-done.md`, self-review with the `review` skill (plus `security-review`/`performance-review` if applicable).

Constraints:

- Speak Russian in the chat/session with the user — never English. Code, comments, commits, docs stay in whatever language the repo conventions require; this is about chat replies only.
- Touch only what this issue needs.
- No test suite — do not add one, do not report its absence as a gap.
- Stop at the author-approval gate (workflow step 11): do not merge, do not mark the issue Done. When ready for review, comment on the issue with the SHAs + summary.
- If the scope is ambiguous or conflicts with a rule/decision record, stop and ask — don't guess.

Report back at the end: worktree path and branch, commit list, lint/build output, self-review findings and what was done about each, anything deliberately left out of scope.
