# Swoosh Server Instructions

This is the canonical instruction file for **every** AI agent working in this repo. `CLAUDE.md` and any other tool-specific entrypoint point here — keep the shared knowledge in `docs/`, not duplicated per tool.

## Scope

These instructions apply to the standalone backend project in this directory. Backend only — never touch or reason about the frontend.

## Read First

- `README.md` — backend setup and runtime assumptions.
- `ai/rules/backend-architecture.md` — module layout and boundaries.
- `ai/rules/auth-and-api-contracts.md` — auth, Swagger, public contracts, password reset, cookies, JWT.
- `ai/rules/code-conventions.md` — TypeScript and constants policy.

## Skills

Skill playbooks live in `ai/skills/` (tool-agnostic Markdown, index in `ai/skills/README.md`):

- `swoosh-backend-module` — NestJS module structure and house-style alignment.
- `nestjs-swagger-docs` — Swagger/OpenAPI documentation changes.
- `swoosh-query-filters` — list, search, and query-filter pipelines.
- `swoosh-auth-flow` — JWT auth, refresh-cookie behavior, password reset, current-user, auth Swagger.
- `swoosh-backend-review` — regression, contract, and docs/skill drift review.
- `swoosh-backend-performance-review` — latency, payload size, and database-cost review.
- `swoosh-backend-security-review` — auth, validation, config, secret handling, data exposure.
- If a change materially reshapes a backend pattern, update the matching skill under `ai/skills/` in the same change.

## Verification

- Run checks from this directory.
- Run `npm run lint` after backend changes.
- Run `npm run build` after deleting files, changing dependencies, or changing public contracts.
- This project has no automated tests; verify behavior by lint, build, and manual reasoning.
- Do not verify or edit the frontend as part of backend-only work.
