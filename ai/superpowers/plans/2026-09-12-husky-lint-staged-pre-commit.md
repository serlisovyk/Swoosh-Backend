# Plan: husky + lint-staged pre-commit gate

Issue: MY-71

## Why

CI is not set up for this repo. A local pre-commit hook is a cheap substitute: block commits that `eslint` would fail, without standing up GitHub Actions.

## Scope

- Add `husky` + `lint-staged` as devDependencies.
- `husky` pre-commit hook runs `lint-staged`.
- `lint-staged` runs `eslint --fix` on staged `*.ts` files. MY-51 already wired prettier into eslint (`eslint-plugin-prettier`, `prettier/prettier` as an `error` rule), so `eslint --fix` alone covers formatting — no separate `prettier --write` step needed.
- `prepare` script (`husky`) so `bun install` (and `npm install`) provisions the hook on a fresh clone.
- No `bun run build` in the hook — too slow for pre-commit; build stays a manual pre-merge/DoD step, unchanged.
- No test-related hook — no test suite exists.

## Out of scope

- GitHub Actions CI.
- Any test-runner hook.
- Changing what `bun run lint` itself checks — the hook reuses the existing eslint config as-is.

## Commit breakdown

1. **docs(ai): plan for husky + lint-staged pre-commit (MY-71)** — this plan, alone, before any code.
2. **feat: add husky pre-commit hook running lint-staged** — devDependencies, `prepare` script, `.husky/pre-commit`, `.lintstagedrc.json`.
3. **docs: document pre-commit hook in README and DoD** — `README.md` setup/checks section, `ai/rules/definition-of-done.md` note that the hook is a fast local pre-check, not a substitute for `bun run lint`/`bun run build` before merge.

## Verification

- `bun run lint` / `bun run build` clean (unchanged, run outside the hook).
- Manual: stage a `.ts` file with a lint violation, `git commit` — expect the hook to block it.
- Manual: stage a clean `.ts` file, `git commit` — expect it to pass without noticeable delay.
- Manual: fresh `bun install` (or `npm install`) provisions `.husky/` (i.e. `prepare` runs `husky`) without manual setup.

## Risks

- Husky v9's `prepare` script format differs from older `husky install`-based setups — use the current `husky` (v9) init flow (`.husky/pre-commit` script directly, no `.huskyrc`/`husky.sh` shim needed).
- Hook must not break environments without git hooks support (CI-like clean clones without a `.git` dir) — modern `husky` (v9) already no-ops safely when there's no `.git`; worth a quick sanity check of the `prepare` script itself (that it doesn't hard-fail when `.git` is absent).
