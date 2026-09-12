# Spec: unbounded queries and missing indexes (products/newsletter/users)

Linear: MY-81

Only two of the four fixes below touch a public contract; the other two are index-only and ship without a spec section (see plan).

## 1. `GET /products?ids=...` — bounded ids and honored `page`/`limit`

**Problem.** `FindAllProductsDto.ids`/`excludeIds` have no `@ArrayMaxSize`, unlike `price` (already capped at 2). `ProductsService.findAllByIds` runs an unbounded `find()` over `_id: { $in: filteredProductIds }` and returns every match — `page`/`limit` are computed by `buildProductListQueryOptions` but silently dropped on this branch. A public, unauthenticated caller can request an arbitrarily large `ids` array and get back every matching product in one response.

**Contract change.**

- `ids`/`excludeIds` are capped at `MAX_PRODUCTS_LIMIT` (100) entries each, enforced by `@ArrayMaxSize` — same shape as `price`'s existing `@ArrayMaxSize(2)`. Exceeding it is a normal `VALIDATION_ERROR` (400), already covered by the existing `ApiInvalidQueryDocs()`/`ApiValidationErrorDocs()` on this DTO.
- `findAllByIds` now honors `page`/`limit`: the response is sliced to the requested page instead of returning every match. `total` reports the full match count (before slicing), matching the `findAll` convention (`{ products, total }`) elsewhere in this service.
- Order is unchanged: the response still preserves the order of the `ids` query param, not the module's `sort` — `sort` continues to be ignored on this branch (documented already, kept as-is). Only `page`/`limit` behavior changes.
- Swagger (`ProductsFindAllDocs`) description updated to state the new `page`/`limit` behavior and the `ids`/`excludeIds` cap.

**Out of scope.** Applying `sort` to the ids branch — not requested, and would break the "response preserves request order" contract the current docs already promise.

## 4. `GET /products/categories` — pagination

**Problem.** `ProductCategoryService.findAll` runs `find()` with no `skip`/`limit` and returns the full collection as a bare array. Low risk today (the collection is small) but unbounded as it grows, and the MY-62 spec that introduced this endpoint explicitly said "no pagination — admin management list, not the catalog." This ticket reverses that call now that a repo-wide audit flagged every unbounded list endpoint.

**Contract change.**

- New optional `page`/`limit` query params, same validated pattern as `favorites` (`FindAllFavoritesDto`): own `dto/find-all-product-categories.dto.ts`, own `PRODUCT_CATEGORY_DEFAULT_LIMIT` (50) / `PRODUCT_CATEGORY_MAX_LIMIT` (100) constants — no `search`/`sort`, this endpoint never had either.
- Response shape changes from a bare array to `{ categories, total }`, matching the `{ <items>, total }` convention used by `products`/`favorites`/the three form modules. `ProductCategoryListResponseDocs` replaces the current `[ProductsCategoryResponseDocs]` Swagger response type.
- Sort stays `{ name: 1 }`, unchanged.
- Swagger (`ProductCategoryFindAllDocs`) updated for the new response shape and query params; `ai/map.md`'s `products/category` row updated since the response shape it doesn't currently mention now has pagination.

**Out of scope.** Changing the public `GET /products/filters` categories list (different endpoint, different purpose — see `ai/rules/auth-and-api-contracts.md`).

## Index-only changes (no contract change, no spec needed)

- `NewsletterSubscriptionSchema.index({ createdAt: -1 })` — same shape as `contact-request`/`individual-order`, same default sort (`CREATED_AT_SORT_OPTIONS.NEWEST`).
- `User.resetPasswordToken` gets `index: true, sparse: true` on the existing `@Prop` — it's the filter field in `consumePasswordResetToken`'s atomic `findOneAndUpdate` and currently has no index. Sparse per the issue's ask; the field defaults to `null` (always present) so sparse mainly matters for documents created before this index existed.

## Verification

- `bun run lint`, `bun run build`.
- No test suite; verify by reasoning: ids-path pagination slicing, category list shape, and that `autoIndex` (dev) picks up both new indexes.
