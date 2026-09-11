# Swoosh Server Instructions

This is the canonical instruction file for **every** AI agent working in this repo. `CLAUDE.md` and any other tool-specific entrypoint point here — keep the shared knowledge in `ai/`, not duplicated per tool.

## Scope

These instructions apply to the standalone backend project in this directory. Backend only — never touch or reason about the frontend.

## Read First

- `README.md` — backend setup and runtime assumptions.
- `ai/map.md` — repo map: modules, cross-cutting packages, entry files, and what the project deliberately does **not** have.
- `ai/rules/architecture.md` — module layout, boundaries, bootstrap, persistence, error handling.
- `ai/rules/auth-and-api-contracts.md` — auth, Swagger, public contracts, password reset, cookies, JWT, error-response contract.
- `ai/rules/code-conventions.md` — TypeScript, naming, types, comments, formatting, constants policy.
- `ai/rules/definition-of-done.md` — the pre-commit / pre-merge gate for a backend change.

## Decisions

`ai/decisions/` records durable decisions and **why** they were made (stateless refresh, email verification removed, no test suite, error-envelope target, knowledge-base layout). Read it before proposing to change or "restore" any of them — rules say what to do now, decisions say why. Reversing one means adding a new dated record, not editing the old.

**Capture new decisions as they surface — do not wait to be asked.** When a durable choice appears in conversation or in a change, say that it should be recorded and offer to add a dated record. Signals worth catching:

- "we will not do X", "always / never do Y" — a standing constraint.
- A deliberate removal that must not be restored later.
- A tradeoff accepted over a named alternative ("A instead of B, because …").
- A target agreed now but implemented later (record it with `Status: accepted (not implemented)`).
- A convention chosen where an obvious alternative exists (e.g. `select: false` instead of `toJSON` hooks).

One-off task details, current-state facts, and anything already covered by `ai/rules/` or `ai/map.md` are **not** decisions — do not create noise records.

## Workflow

`ai/workflow.md` is the end-to-end flow for taking a task: pick up the issue → branch → orient → spec + plan → implement → docs → verify → DoD → self-review → **author approval** → report → merge. Follow it.

The parts that never bend:

- Write a **plan** (always) and a **spec** (when the task changes behavior or a public/data contract) under `ai/superpowers/` (`plans/`, `specs/`). Format is up to you — keep it concise and specific.
- Commit the plan and spec together as a **single commit**, before any implementation commit.
- Then implement — feature code lands in separate, later commits.
- Work on a branch named after the Linear issue, never directly on `main`.
- **Nothing merges and nothing is marked done without the repo author's explicit approval.** Silence or a neutral reply is not approval.
- No test suite exists; verification is `bun run lint` + `bun run build`.

## Skills

Skill playbooks live in `ai/skills/` (tool-agnostic Markdown, index in `ai/skills/README.md`):

- `module` — NestJS module structure and house-style alignment.
- `mongoose-models` — schemas, fields, indexes, references, sensitive-field visibility.
- `swagger-docs` — Swagger/OpenAPI documentation changes.
- `query-filters` — list, search, and query-filter pipelines.
- `auth-flow` — JWT auth, refresh-cookie behavior, password reset, current-user, auth Swagger.
- `review` — regression, contract, and docs/skill drift review.
- `performance-review` — latency, payload size, and database-cost review.
- `security-review` — auth, validation, config, secret handling, data exposure.
- If a change materially reshapes a backend pattern, update the matching skill under `ai/skills/` in the same change.

## Verification

- Run checks from this directory.
- Run `bun run lint` after backend changes.
- Run `bun run build` after deleting files, changing dependencies, or changing public contracts.
- This project has no automated tests; verify behavior by lint, build, and manual reasoning.
- Do not verify or edit the frontend as part of backend-only work.
