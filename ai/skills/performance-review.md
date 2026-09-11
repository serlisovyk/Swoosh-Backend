---
name: performance-review
description: Use when reviewing Swoosh Server backend code for latency, payload size, Mongo query cost, indexes, pagination, expensive loops, or avoidable external calls.
---

# Performance Review

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

## Reference case: `findFiltersMetadata` (MY-63)

A public, unauthenticated, parameter-less endpoint hit on every catalog page load (`GET /products/filters`) ran 5 Mongo queries — 4 `distinct()` calls plus 1 aggregate — with no supporting indexes on `sizes`, `material`, `colors.name`, `price`, or `createdAt`, and no cache. Two independent fixes, not one:

- **Indexes tied to the actual query paths** — `distinct()` and filters/sorts in `products.utils.ts` justified `sizes`, `material`, `colors.name`, `price`, `createdAt`. Indexes alone remove collection scans; they do not remove the round-trip cost of calling Mongo 5 times per hit.
- **Cache on the endpoint itself** — a result that's identical for every visitor until the catalog changes is a cache candidate independent of how cheap the underlying queries are. A simple in-memory TTL cache (60s, no event invalidation) was chosen over Redis/event-based invalidation as the minimal fix that matches the acceptable staleness for aggregate filter metadata — see `ai/decisions/2026-09-11-products-filters-search-and-cache.md`.

When reviewing a public read endpoint with no request parameters: check both — does it have the indexes its own queries need, and does it need a cache at all given how often it's called versus how often its underlying data changes.
