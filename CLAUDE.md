# CLAUDE.md

`AGENTS.md` is the single source of truth for working in this repo — same rules for every AI agent. Read it, then the linked docs. Nothing agent-specific is duplicated here.

@AGENTS.md

## Quick orientation

- Standalone NestJS 11 backend for the Swoosh store API. MongoDB/Mongoose, JWT auth (Passport), Turnstile, Resend email, Swagger. Global prefix `/api/v1`. **Backend only.**
- Repo map: `ai/map.md` — modules, cross-cutting packages, entry files, and what the project deliberately does **not** have. Read it before exploring `src/`.
- Rules of record: `ai/rules/` (architecture, auth-and-api-contracts, code-conventions, definition-of-done).
- Skill playbooks: `ai/skills/` (index in `ai/skills/README.md`) — use the matching one before touching modules, models, auth, query filters, or Swagger; update it in the same change if you reshape a pattern.
- Decision records: `ai/decisions/` — why durable choices were made. Read before proposing to change or restore one, and propose a new record when a fresh decision surfaces.
- No automated test suite. Verify with `npm run lint` and `npm run build` — do not add or assume tests unless explicitly asked.
