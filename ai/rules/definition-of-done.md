# Definition of Done

A backend change is done when all of the following hold. Use it as a pre-commit / pre-merge gate.

## Code

- New or changed inputs are validated at the boundary with `class-validator` DTOs; nothing unvalidated reaches a service.
- Controllers stay thin; business logic lives in services; Mongoose access lives in services (or repositories), never in controllers.
- Public responses are mapped to a response shape — no raw Mongoose documents, no persistence leakage, no secrets/hashes/tokens/internal fields.
- Privileged/admin routes are protected by role guards.
- Reused values and messages are in `<feature>.constants.ts`; stale constants/types removed after a feature is deleted.
- Errors use built-in Nest HTTP exceptions (aligned to the target envelope in `auth-and-api-contracts.md` once that filter is wired).

## Security baseline

- `helmet` and explicit credentialed CORS remain intact.
- Turnstile stays on public-credential endpoints; auth throttling stays stricter than global defaults.
- Secrets come from env, are documented in `.env.sample`, and never appear in responses, logs, or docs examples.

## Docs (in the same change)

- Swagger `*.swagger.ts` matches the request/response shape and auth markers.
- `README.md` updated if setup, scripts, or env changed.
- `ai/rules/*` or `ai/skills/*` updated if the change reshaped a pattern.
- For behavior/contract changes: the `ai/superpowers/` spec + plan were committed first, per the Workflow in `AGENTS.md`.

## Verification

- `npm run lint` is clean.
- `npm run build` is clean (required after deleting files, changing dependencies, or changing public contracts).
- No automated test suite exists — verify by lint, build, and manual reasoning. Do not add tests unless explicitly asked.

## Commits

- Commit in milestones, not one giant final snapshot.
- Inspect `git status` and `git diff` before committing.
- Use specific, conventional messages — never `update`, `fix`, or `changes`.

## Out of scope unless explicitly requested

- New infrastructure (Redis, queues, search), OAuth, email verification, server-side auth sessions, or new global interceptors/filters — these need an approved spec first.
