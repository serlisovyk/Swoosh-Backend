# Swoosh Server Instructions

This is the canonical instruction file for **every** AI agent working in this repo. `CLAUDE.md` and any other tool-specific entrypoint point here — keep the shared knowledge in `ai/`, not duplicated per tool.

## Scope

These instructions apply to the standalone backend project in this directory. Backend only — never touch or reason about the frontend.

## Read First

- `README.md` — backend setup and runtime assumptions.
- `ai/rules/architecture.md` — module layout, boundaries, bootstrap, persistence, error handling.
- `ai/rules/auth-and-api-contracts.md` — auth, Swagger, public contracts, password reset, cookies, JWT, error-response contract.
- `ai/rules/code-conventions.md` — TypeScript, naming, types, comments, formatting, constants policy.
- `ai/rules/definition-of-done.md` — the pre-commit / pre-merge gate for a backend change.

## Workflow (spec + plan first)

Before writing feature code for a task:

- Write a **plan** (always) and a **spec** (when the task changes behavior or a public/data contract) under `ai/superpowers/` (`plans/`, `specs/`). Format is up to you — keep it concise and specific.
- Commit the plan and spec together as a **single commit**, before any implementation commit.
- Then implement — feature code lands in separate, later commits.
- No test suite exists; verification is `npm run lint` + `npm run build`.

## Skills

Skill playbooks live in `ai/skills/` (tool-agnostic Markdown, index in `ai/skills/README.md`):

- `module` — NestJS module structure and house-style alignment.
- `swagger-docs` — Swagger/OpenAPI documentation changes.
- `query-filters` — list, search, and query-filter pipelines.
- `auth-flow` — JWT auth, refresh-cookie behavior, password reset, current-user, auth Swagger.
- `review` — regression, contract, and docs/skill drift review.
- `performance-review` — latency, payload size, and database-cost review.
- `security-review` — auth, validation, config, secret handling, data exposure.
- If a change materially reshapes a backend pattern, update the matching skill under `ai/skills/` in the same change.

## Verification

- Run checks from this directory.
- Run `npm run lint` after backend changes.
- Run `npm run build` after deleting files, changing dependencies, or changing public contracts.
- This project has no automated tests; verify behavior by lint, build, and manual reasoning.
- Do not verify or edit the frontend as part of backend-only work.
