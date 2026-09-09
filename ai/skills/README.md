# Skills

Server-local skill playbooks. Tool-agnostic Markdown — any AI agent (Claude, Codex, others) reads them directly. Each file has `name` + `description` frontmatter so it maps to a matching skill entry when a tool supports one.

If a change materially reshapes a backend pattern, update the matching skill in the same change.

## Build / align

- [swoosh-backend-module](swoosh-backend-module.md) — NestJS module structure, DTOs, models, boundaries, house style.
- [swoosh-auth-flow](swoosh-auth-flow.md) — JWT auth, refresh cookie, password reset, guards, current-user, auth Swagger.
- [swoosh-query-filters](swoosh-query-filters.md) — list/search/pagination/sort DTO transforms and Mongo filter builders.
- [nestjs-swagger-docs](nestjs-swagger-docs.md) — Swagger/OpenAPI wrappers and public contract docs.

## Review

- [swoosh-backend-review](swoosh-backend-review.md) — regressions, contract/doc/skill drift, boundaries, verification gaps.
- [swoosh-backend-performance-review](swoosh-backend-performance-review.md) — query cost, indexes, pagination, payload size.
- [swoosh-backend-security-review](swoosh-backend-security-review.md) — auth, validation, secrets, cookies, data exposure.

## Related

- Rules of record: [`ai/rules`](../rules).
- Agent entrypoints: [`AGENTS.md`](../../AGENTS.md), [`CLAUDE.md`](../../CLAUDE.md).
