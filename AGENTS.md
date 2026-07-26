# Backend Instructions

## Scope

These instructions apply to everything under `server`.

## Read first

- Read `../docs/rules/backend-architecture.md` for all backend changes
- Read `../docs/rules/auth-and-api-contracts.md` when the task touches auth, Swagger, public contracts, password reset, or other cross-stack API behavior

## Skills

- Use `swoosh-backend-module` for backend module structure and house-style alignment
- Use `nestjs-swagger-docs` for Swagger and OpenAPI documentation changes
- Use `swoosh-query-filters` for list, search, and query-filter pipelines
- Use `swoosh-auth-flow` for auth changes that span cookies, Swagger contracts, frontend auth flow, or current-user behavior
- Use `swoosh-backend-review` for backend code review focused on regressions, contract safety, and docs or skill drift
- Use `swoosh-backend-performance-review` for performance-focused backend review on latency, payload size, and database cost
- Use `swoosh-backend-security-review` for security-focused backend review on auth, validation, config, and data exposure
- If a change materially reshapes one of those backend patterns, update the corresponding repo-local skill under `.codex/skills`

## Verification

- Run backend checks from `server`
- Prefer `npm run lint` after backend changes
- If auth or API contract changes affect the frontend as well, verify both sides
- If logic changes, prefer `npm run test` as well when possible
