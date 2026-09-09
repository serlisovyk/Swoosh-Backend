# Skills

Server-local skill playbooks. Tool-agnostic Markdown — any AI agent (Claude, Codex, others) reads them directly. Each file has `name` + `description` frontmatter so it maps to a matching skill entry when a tool supports one.

If a change materially reshapes a backend pattern, update the matching skill in the same change.

## Build / align

- [module](module.md) — NestJS module structure, DTOs, models, boundaries, house style.
- [mongoose-models](mongoose-models.md) — schemas, fields, indexes, refs, subdocuments, `select: false` for secrets.
- [auth-flow](auth-flow.md) — JWT auth, refresh cookie, password reset, guards, current-user, auth Swagger.
- [query-filters](query-filters.md) — list/search/pagination/sort DTO transforms and Mongo filter builders.
- [swagger-docs](swagger-docs.md) — Swagger/OpenAPI wrappers and public contract docs.

## Review

- [review](review.md) — regressions, contract/doc/skill drift, boundaries, verification gaps.
- [performance-review](performance-review.md) — query cost, indexes, pagination, payload size.
- [security-review](security-review.md) — auth, validation, secrets, cookies, data exposure.

## Related

- Task flow: [`ai/workflow.md`](../workflow.md) — the end-to-end sequence these skills plug into.
- Repo map: [`ai/map.md`](../map.md) — modules, packages, entry files, and what the project deliberately lacks.
- Rules of record: [`ai/rules`](../rules) — including [`definition-of-done`](../rules/definition-of-done.md).
- Decision records: [`ai/decisions`](../decisions) — why durable choices were made; propose a record when a new one surfaces.
- Agent entrypoints: [`AGENTS.md`](../../AGENTS.md), [`CLAUDE.md`](../../CLAUDE.md).
