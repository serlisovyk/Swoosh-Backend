# Products: regex search kept, filters metadata cached in-memory

Date: 2026-09-11 · Status: accepted

## Context

MY-63 audited `GET /products/filters` and the catalog query builder: no indexes on `sizes`, `material`, `colors.name`, `price`, `createdAt`, and no cache on a public, unauthenticated, parameter-less aggregate endpoint hit on every catalog page load. Two choices had to be made explicitly rather than picked ad hoc.

## Decision

1. **Search stays `$or` regex, not `$text`.** `buildProductListQueryOptions` matches `search` against `title`/`description` with an unanchored, case-insensitive regex — "contains this substring anywhere". A MongoDB `$text` index would tokenize by word instead, which is not the same contract: `"boo"` would stop matching `"boots"`. The frontend depends on the current substring behavior, so switching is a public-contract change that needs frontend sign-off first, not a performance-driven side effect of this ticket. No text index was added.
2. **`findFiltersMetadata` gets a simple in-memory TTL cache (60s), no event invalidation.** The endpoint is public, takes no parameters, and its result only changes when the catalog changes — a textbook cache candidate. Of the three options the issue raised (TTL cache, event-based invalidation on create/update/remove, or no cache at all if indexes are enough), event invalidation was rejected as unnecessary coupling for data that tolerates staleness, and skipping the cache entirely was rejected because indexes only remove collection scans — they don't remove the 5 round-trips to Mongo on every hit of a hot, unauthenticated route.

## Consequences

- `GET /products/filters` can serve data up to 60 seconds stale relative to the last product `create`/`update`/`remove`. Acceptable for aggregate filter metadata; would **not** be acceptable for a single product's price/availability, which is not cached here or anywhere else.
- The cache is a plain private field on `ProductsService` (`filtersMetadataCache`) — it does not survive a process restart and is not shared across app instances. No Redis or other shared cache infrastructure was introduced for this; if multi-instance consistency for this endpoint becomes a real requirement, that is a new decision.
- Indexes were added on `sizes`, `material`, `colors.name`, `price`, and `createdAt` regardless of the cache decision — they also serve the product list/search query builder, not just this endpoint.
- Reversing the search decision (adopting `$text`) means a new dated record here plus a spec, since it changes the public search contract.
