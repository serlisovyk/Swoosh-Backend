# Share pagination arithmetic, not the pagination mechanism

Date: 2026-09-11 · Status: implemented (MY-40)

## Context

`products` and `favorites` both compute `offset = (page - 1) * limit` and both default an omitted `page` to `1`. The formula lived twice — once inline in `products.utils.ts`, once in `favorites.utils.ts`/`favorites.service.ts` — and had already started drifting (the default-page fallback lived in a different layer in each module).

`products` paginates in Mongo (`skip`/`limit` on the query). `favorites` paginates by slicing an in-memory array of favorite product ids, because the ids array is itself the source of ordering (`orderProductsByIds`) and is capped at `FAVORITES_MAX_PRODUCT_IDS`.

## Decision

Share only the arithmetic: `resolvePaginationOffset(page, limit)` + `DEFAULT_PAGE` in `src/shared/utils/pagination.utils.ts`. Do **not** unify the two pagination mechanisms — `products` keeps querying Mongo, `favorites` keeps slicing the in-memory array. Moving `favorites` to server-side (aggregation) pagination is a separate, larger task, not bundled here.

Each module's default `limit` value stays in its own `<feature>.constants.ts` (`DEFAULT_PRODUCTS_LIMIT = 18`, `FAVORITES_DEFAULT_LIMIT = 12`) — only the "page defaults to 1" rule and the offset formula are centralized.

## Consequences

- Both modules import `resolvePaginationOffset` from `@shared/utils` instead of re-deriving the formula.
- If `favorites` ever moves to server-side pagination, `resolvePaginationOffset` still applies — it doesn't assume in-memory slicing.
- Query-param Swagger docs for page/limit are similarly shared via `QueryPagePropertyDocs`/`QueryLimitPropertyDocs` (`@common/swagger`), each module supplying its own `example`/`maximum`.
