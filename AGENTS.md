# Swoosh Server Instructions

## Scope

These instructions apply to the standalone backend project in this directory.

## Read First

- Read `README.md` for backend setup and runtime assumptions.
- Read `docs/rules/backend-architecture.md` for backend code changes.
- Read `docs/rules/auth-and-api-contracts.md` when touching auth, Swagger, public contracts, password reset, cookies, or JWT behavior.
- Read `docs/rules/code-conventions.md` for TypeScript and constants policy.

## AI Docs

- Use `docs/ai/specs` to capture what should change and why.
- Use `docs/ai/plans` for approved implementation plans.
- Use `docs/ai/decisions` for durable architecture decisions.
- Use `docs/ai/reviews` for review and verification notes.

## Skills

- Use `swoosh-backend-module` for NestJS module structure and house-style alignment.
- Use `nestjs-swagger-docs` for Swagger and OpenAPI documentation changes.
- Use `swoosh-query-filters` for list, search, and query-filter pipelines.
- Use `swoosh-auth-flow` for JWT auth, refresh-cookie behavior, password reset, current-user behavior, and auth Swagger.
- Use `swoosh-backend-review` for regression, contract, and docs/skill drift review.
- Use `swoosh-backend-performance-review` for latency, payload size, and database-cost review.
- Use `swoosh-backend-security-review` for auth, validation, config, secret handling, and data exposure review.
- If a change materially reshapes a backend pattern, update the matching server-local skill under `.codex/skills`.

## Verification

- Run checks from this directory.
- Prefer `npm run lint` after backend changes.
- Run `npm run test` when behavior changes.
- Run `npm run build` after deleting files, changing dependencies, or changing public contracts.
- Do not verify or edit the frontend as part of backend-only work.
