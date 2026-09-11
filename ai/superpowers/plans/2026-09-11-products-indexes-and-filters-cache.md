# Plan: Product indexes + findFiltersMetadata cache

Issue: MY-63 · Branch: `my-63-products-indexes-and-filters-cache`

## Decisions (to be recorded as a decision record)

1. **Search stays regex, not `$text`.** `$text` changes semantics (word-tokenized vs substring) — a public search contract, cannot change without the frontend. No text index added.
2. **`findFiltersMetadata` cache: in-memory TTL, 60s, no event invalidation.** The simplest of the three options raised in the issue; the endpoint is public/unauthenticated/parameter-less — deterministic within the TTL window. Event-based invalidation would add coupling (create/update/remove would need to know about the cache) for precision that isn't needed here — 60s of staleness for the sizes/materials/colors/categories list is acceptable (the issue itself calls this acceptable for filters). Doesn't survive a restart or multiple instances — accepted, this is a single process without load balancing at this stage (no Redis, not introducing one for this ticket).

## Commit breakdown

1. **docs(ai): spec + plan for MY-63** — this file + the spec, one commit, before code.
2. **feat(products): add indexes for filters/sort fields** — `product.model.ts` (`sizes`, `material`, `price` — `index: true`; explicit `ProductSchema.index({ createdAt: -1 })`), `product-color.model.ts` (`name` — `index: true`, gives multikey `colors.name`).
3. **feat(products): in-memory TTL cache for findFiltersMetadata** — `products.constants.ts` (`FILTERS_METADATA_CACHE_TTL_MS`), `products.service.ts` (private cache field + read/write in `findFiltersMetadata`).
4. **docs(ai): record decisions + update skills/map for MY-63** — `ai/decisions/2026-09-11-products-filters-search-and-cache.md`, `ai/skills/mongoose-models.md` (new indexes), `ai/skills/performance-review.md` (this case as a reference).

## Implementation details

### Indexes

- `Product.sizes`: `@Prop({ type: [Number], default: [], index: true })` — multikey, used by `distinct('sizes')` and the `$in` filter.
- `Product.material`: `@Prop({ default: '', trim: true, index: true })` — used by `distinct('material', ...)` and the `$in` filter.
- `Product.price`: `@Prop({ required: true, min: 0, index: true })` — range filter + `priceAsc`/`priceDesc` sort.
- `createdAt`: no class field (comes from `timestamps: true`), so index via `ProductSchema.index({ createdAt: -1 })` after `SchemaFactory.createForClass` — `newest`/`oldest` sort.
- `ProductColor.name`: `@Prop({ required: true, trim: true, index: true })` — an index on the nested field produces a multikey `colors.name` index, used by `distinct('colors.name', ...)` and the `$in` filter.
- `colors.name` is filtered via regex (`createExactRegex`, anchored `^...$` with only the `i` flag) — an anchored regex **can** use an index (unlike `search`, which is unanchored). The index is justified primarily for `distinct` either way.

### Cache

- Constant in `products.constants.ts`: `export const FILTERS_METADATA_CACHE_TTL_MS = 60_000`.
- In `ProductsService`: private field `private filtersMetadataCache: { data: ProductFiltersMetadata; expiresAt: number } | null = null`.
- At the start of `findFiltersMetadata()`: if `this.filtersMetadataCache` exists and `Date.now() < expiresAt` — return `data` without hitting Mongo.
- At the end — compute the result as today, store `this.filtersMetadataCache = { data: result, expiresAt: Date.now() + FILTERS_METADATA_CACHE_TTL_MS }`, return `result`.
- No invalidation on `create`/`update`/`remove` — deliberate (see decision above).

## Verification

- `npm run lint`
- `npm run build`
- Manual pass (if Mongo is running locally): `GET /products/filters` twice in a row — second call hits no new Mongo queries (log/response time); recomputes after 60s.
- Review the model diffs — indexes match the fields named in the issue.

## Out of scope

- Caching `GET /products`, category CRUD, filtering business logic changes — not touched (see spec).
- Applying indexes in production with `autoIndex: false` (MY-45) — a separate operational step, not part of this ticket.
