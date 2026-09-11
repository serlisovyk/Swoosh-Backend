# Plan: remove pagination duplication between products and favorites (MY-40)

No spec — response shapes already match (`{ products, total }` in both `ProductsService.findAll` and `FavoritesService.findAll`/`FavoritesListResponse`), and this change does not alter them. Page/limit validation ranges already match too (`page >= 1`, `1 <= limit <= 100`). Pure internal refactor + a Swagger doc fix, per `ai/workflow.md` step 5 ("spec only when behavior/contract changes").

## What's duplicated today

- Offset arithmetic: `products.utils.ts` computes `skip = ((page ?? 1) - 1) * limitOption` inline; `favorites.service.ts` computes `const page = dto.page ?? 1` then calls `paginateFavoriteProductIds(ids, page, limit)`, which repeats `offset = (page - 1) * limit`. Same formula, two spots, two different layers (query-options builder vs. service).
- Swagger page/limit property docs: `ProductsQueryPagePropertyDocs`/`ProductsQueryLimitPropertyDocs` vs `FavoritesQueryPagePropertyDocs`/`FavoritesQueryLimitPropertyDocs` — same shape, different `example`, and favorites' limit doc is missing `maximum` even though `FAVORITES_MAX_LIMIT` is enforced by `@Max()` in the DTO (Swagger/runtime mismatch — bug, fixed here).

## What is NOT touched (per the issue's explicit "don't merge mechanisms")

- `products` keeps paginating in Mongo (`skip`/`limit` on the query). `favorites` keeps slicing the in-memory id array. Only the arithmetic and the default-page rule move to one place.
- Response shapes, default `limit` values (18 vs 12), and validation ranges stay as they are — already consistent, no reason to change them.

## Changes

1. **`src/shared/utils/pagination.utils.ts`** (new) — `DEFAULT_PAGE = 1` and `resolvePaginationOffset(page: number | undefined, limit: number): number`, the one `((page ?? DEFAULT_PAGE) - 1) * limit` formula. Exported from `src/shared/utils/index.ts`.
2. **`src/modules/products/products.utils.ts`** — `buildProductListQueryOptions` calls `resolvePaginationOffset(page, limitOption)` instead of the inline formula.
3. **`src/modules/favorites/favorites.utils.ts`** — `paginateFavoriteProductIds(favoriteProductIds, page, limit)` takes `page: number | undefined` and computes its offset via `resolvePaginationOffset` internally.
4. **`src/modules/favorites/favorites.service.ts`** — drop the local `const page = dto.page ?? 1`; pass `dto.page` straight through (the "page defaults to 1" rule now lives only in `resolvePaginationOffset`).
5. **`src/common/swagger/utils/swagger.utils.ts`** — add `QueryPagePropertyDocs({ example })` and `QueryLimitPropertyDocs({ example, maximum })`, following the existing `AuthUserPropertyDocs`-style PascalCase factory pattern (not the lowercase `create*` factories, since these are meant to be called directly by feature `*.swagger.ts` files with module-specific numbers). Exported from `@common/swagger`.
6. **`src/modules/products/products.swagger.ts`** — `ProductsQueryPagePropertyDocs = QueryPagePropertyDocs({ example: 1 })`, `ProductsQueryLimitPropertyDocs = QueryLimitPropertyDocs({ example: DEFAULT_PRODUCTS_LIMIT, maximum: 100 })`. DTO/controller call sites (`@ProductsQueryPagePropertyDocs()`) are unchanged.
7. **`src/modules/favorites/favorites.swagger.ts`** — same pattern with `FAVORITES_DEFAULT_LIMIT` / `FAVORITES_MAX_LIMIT` — this also fixes the missing `maximum` in the favorites limit doc.
8. **Docs**: `ai/skills/query-filters.md` (mention the shared offset helper + shared query page/limit Swagger factories), `ai/map.md` (drop "no shared pagination-meta helper" — replace with the new `shared/utils/pagination.utils.ts` entry; the per-module list-response assembly is still separate, that part is unchanged), new decision record `ai/decisions/2026-09-11-shared-pagination-arithmetic.md` (share the arithmetic, not the mechanism — and why).

## Commit breakdown

1. `docs(ai): plan for unifying pagination arithmetic (MY-40)` — this file, alone (no spec needed).
2. `refactor(pagination): share offset arithmetic between products and favorites` — items 1-4.
3. `refactor(swagger): share query page/limit property docs, fix favorites limit maximum` — items 5-7.
4. `docs(ai): document shared pagination helper` — item 8.

## Verification

- `npm run lint`, `npm run build`.
- Manual: start dev server, hit `/api/v1/products?page=2&limit=5` and `/api/v1/favorites?page=2&limit=5` (with a token) and confirm the returned slice/skip math is unchanged from before (same items, same `total`), and check `/api/v1/docs` shows `maximum` on the favorites limit field now.

## Explicitly out of scope

- Moving `favorites` to server-side (aggregation) pagination — separate task per the issue.
- A shared response "envelope" for lists (`page`/`limit` echoed back) — the issue explicitly scopes this out; current shape (`{ products, total }` / `{ favoriteProductIds, total }`) is untouched.
- `src/common/swagger` vs `src/shared` boundary (MY-44) — the new Swagger factories land in `src/common/swagger` next to the existing ones, matching current structure.
