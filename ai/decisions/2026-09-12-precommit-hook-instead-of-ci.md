# Local pre-commit hook instead of CI

Date: 2026-09-12 · Status: accepted

## Context

GitHub Actions CI was considered overhead at this project's current stage. Without any automated gate, a commit that `bun run lint` would reject could still land on a branch.

## Decision

A local `husky` pre-commit hook runs `lint-staged` (`eslint --fix` on staged `*.ts` files) instead of standing up CI. The `prepare` script provisions the hook automatically on `bun install` (or `npm install`), so no manual setup step is needed after cloning.

## Consequences

- The hook only blocks commits locally; it is not a merge gate and cannot be relied on if someone bypasses it (`git commit --no-verify`) or commits from an environment where `prepare` didn't run.
- `bun run build` deliberately does not run in the hook — too slow for a pre-commit check. Build verification stays a manual step before merge, per `ai/rules/definition-of-done.md`.
- Adding GitHub Actions CI later is a new decision, not a reversal of this one — they are not mutually exclusive.
