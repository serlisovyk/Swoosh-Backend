# Spec: Product indexes + findFiltersMetadata cache

Issue: MY-63

## Observable behavior — unchanged

- `GET /products/filters` — same response shape (`ProductsFiltersMetadataResponseDocs`), same composition of `sizes`/`materials`/`colors`/`categories`/`priceRange`.
- `GET /products?search=...` — search semantics unchanged: stays `$or` regex (case-insensitive "contains substring" over `title`/`description`), **not** switched to `$text`. Reason: `$text` tokenizes by word and is not equivalent to the current substring match — the frontend relies on the current behavior, and changing the public search contract without frontend sign-off is not acceptable (see the risks noted in the issue). Documented as a decision.
- All other filters (`sizes`, `colorName`, `material`, `category`, `price`, `isHit`, `isNewArrival`, `hasDiscount`) — no change to the query-building logic (`products.utils.ts`), only new indexes backing them.

## Observable changes

- `GET /products/filters` may serve data up to 60 seconds stale relative to the last product `create`/`update`/`remove` (in-memory TTL cache). Previously the result was always current at request time. Acceptable for public aggregates not tied to a single product (sizes/materials/colors/categories/price range) — this ticket does not propose caching a single product's price/availability.

## Out of scope (confirmed)

- Caching `GET /products` (the listing) — not touched.
- Category CRUD — not touched.
- Filtering business logic — not touched.
- Global exception filter / error envelope — not touched.
