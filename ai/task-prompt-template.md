# Task session prompt template

Fill in `{ISSUE}` and send it as the session's first message. Nothing else to fill in — the agent works out and creates the branch and worktree itself.

---

Pick up Linear issue **{ISSUE}**.

First, set up the environment:

- Fetch the issue from Linear, get its `gitBranchName`.
- Create a worktree next to the current repo, named after the issue (e.g. `../swoosh-{issue-lowercased}`), on branch `<issue-id>-<slug>` (lowercase, e.g. `my-39-error-envelope`, no username prefix), off latest `main`: `git worktree add <path> <branch>`. Don't use Linear's `gitBranchName` as-is — it prepends a username, and its slug is often a transliteration (Russian words spelled in Latin letters, not real English); write your own short English slug instead.
- Copy `.env` into the worktree (not a symlink), install dependencies there.
- Do all further work inside that worktree, not in the original repo copy.

Then follow `ai/workflow.md` end to end for this issue: read `AGENTS.md`, orient via `ai/map.md` and the relevant `ai/rules/*` + `ai/skills/*`, move the issue to `In Progress`, write spec+plan under `ai/superpowers/` and commit them together in a single commit before any code, implement per the plan's commit breakdown, update docs in the same change, verify with `npm run lint` / `npm run build`, walk `ai/rules/definition-of-done.md`, self-review with the `review` skill (plus `security-review`/`performance-review` if applicable).

Constraints:

- Speak Russian in the chat/session with the user — never English. This is about chat replies only.
- Spec and plan files are written in English regardless — same as code, comments, and commits. Only chat replies follow the author's language.
- Touch only what this issue needs.
- No test suite — do not add one, do not report its absence as a gap.
- Stop at the author-approval gate (workflow step 11): do not merge, do not mark the issue Done. When ready for review, comment on the issue with the SHAs + summary.
- If the scope is ambiguous or conflicts with a rule/decision record, stop and ask — don't guess.

Report back at the end, in Russian (this is chat, not a file):

- **what was done** — a short plain-language bullet list, point by point, no retelling of the issue/plan, and no need to open the diff to get the point (e.g. "refresh-token expiry is now read via `getOrThrow`", not "fixed auth per the plan");
- worktree path and branch;
- commit list, what each one does;
- lint/build output;
- self-review findings and what was done about each;
- anything deliberately left out of scope.
