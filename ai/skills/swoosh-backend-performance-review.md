---
name: swoosh-backend-performance-review
description: Use when reviewing Swoosh Server backend code for latency, payload size, Mongo query cost, indexes, pagination, expensive loops, or avoidable external calls.
---

# Swoosh Backend Performance Review

## Focus

- **Mongo query shape** — filters hit indexed fields; projections trim unused fields; no full-collection scans in request paths. Check builders in `<feature>.utils.ts` (e.g. `buildProductListQueryOptions`).
- **Pagination** — every list endpoint bounds results; no unbounded responses. Confirm `limit`/`page` applied before returning.
- **Indexes** — flag a missing index only when tied to a concrete query path (a real `filters`/`sort` combination in a builder or service).
- **In-memory work** — watch for large arrays sorted/deduped/mapped per request (e.g. favorites id ordering in `favorites.utils.ts`); acceptable for small sets, flag when it can grow unbounded.
- **External calls in request paths** — email (Resend), Turnstile, and other network calls should not sit on hot read paths unnecessarily.
- **DTO transforms / filter builders** — keep them cheap; no repeated regex compilation or redundant passes.

## Output

- One line per finding: `path:line — problem. fix.`
- Prefer concrete query/index/loop evidence over speculation. If cost depends on data volume, say so.
