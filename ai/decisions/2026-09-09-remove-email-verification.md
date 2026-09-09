# Email verification and OAuth removed

Date: 2026-09-09 · Status: accepted

## Context

Auth had grown extra branches: email confirmation and external providers. For the current scope that is surface area with no payoff — code, user fields, emails, and docs to keep in sync.

## Decision

Keep JWT email/password auth only. Removed: the email confirmation step (constants, user fields, email template, endpoints, fixtures) and external OAuth providers.

Commits: `b33f07a` (remove email verification), `bd84714` (remove stale auth constants), `a73115c` (remove stale email verification fixture).

## Consequences

- `register` issues tokens immediately — there is no "unverified" state. Guards and the JWT strategy do not check a verification flag.
- Do not reintroduce OAuth, email verification, or server-side auth sessions **without a new spec and explicit approval** (enforced in `ai/rules/auth-and-api-contracts.md`).
- Do not document removed endpoints in Swagger.
