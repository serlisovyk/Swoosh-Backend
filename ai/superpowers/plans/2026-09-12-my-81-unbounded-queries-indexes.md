# Plan: unbounded queries and missing indexes (MY-81)

See spec (`ai/superpowers/specs/2026-09-12-my-81-unbounded-queries-indexes.md`) for the two contract changes (points 1 and 4). Points 2 and 3 are index-only.

## 1. Products: cap `ids`/`excludeIds`, paginate `findAllByIds`

- `src/modules/products/products.constants.ts` — add `PRODUCT_QUERY_IDS_MAX_SIZE_ERROR` (reused by both `ids` and `excludeIds`).
- `src/modules/products/dto/find-all-products.dto.ts` — add `@ArrayMaxSize(MAX_PRODUCTS_LIMIT, { message: PRODUCT_QUERY_IDS_MAX_SIZE_ERROR })` to `ids` and `excludeIds`.
- `src/modules/products/products.service.ts`:
  - `findAll` passes `skip`/`limit` into `findAllByIds`.
  - `findAllByIds(productIds, filters, excludeIds, skip, limit)` builds `orderedProducts` exactly as today (order preserved from `productIds`, filtered by `excludeIds` and the Mongo match), then returns `{ products: orderedProducts.slice(skip, skip + limit), total: orderedProducts.length }`. The `find()` itself stays as-is — it's already bounded to at most `MAX_PRODUCTS_LIMIT` matches once the DTO cap lands, so no `.skip()/.limit()` is needed on the Mongo query itself; the slice happens on the ordered, filtered result.
- `src/modules/products/products.swagger.ts` — update `ProductsFindAllDocs`'s description: still preserves ids order and ignores `sort`, but `page`/`limit` are now honored; note the `MAX_PRODUCTS_LIMIT` cap on `ids`/`excludeIds`.

## 2. Newsletter subscription index

- `src/modules/forms/newsletter-subscription/models/newsletter-subscription.model.ts` — add `NewsletterSubscriptionSchema.index({ createdAt: -1 })` after `SchemaFactory.createForClass`, same line shape as `contact-request.model.ts`.

## 3. User reset-token index

- `src/modules/users/models/user.model.ts` — add `index: true, sparse: true` to the existing `resetPasswordToken` `@Prop`.

## 4. Product categories pagination

- `src/modules/products/category/product-category.constants.ts` — add `PRODUCT_CATEGORY_DEFAULT_LIMIT` (50), `PRODUCT_CATEGORY_MAX_LIMIT` (100), `PRODUCT_CATEGORY_QUERY_LIMIT_MAX_ERROR`.
- New `src/modules/products/category/product-category.types.ts` — `ProductCategoryListResponse` (`{ categories: ProductCategory[]; total: number }`), following the `NewsletterSubscriptionListResponse` shape.
- New `src/modules/products/category/dto/find-all-product-categories.dto.ts` — `page`/`limit` only (no `search`/`sort`), same validator shape as `FindAllFavoritesDto`.
- `src/modules/products/category/product-category.swagger.ts`:
  - `ProductCategoryQueryPagePropertyDocs`/`ProductCategoryQueryLimitPropertyDocs` (via the shared `QueryPagePropertyDocs`/`QueryLimitPropertyDocs` factories).
  - `ProductCategoryListResponseDocs` (`categories: ProductsCategoryResponseDocs[]`, `total: number`).
  - `ProductCategoryFindAllDocs` — response type becomes `ProductCategoryListResponseDocs`, description mentions pagination, add `ApiInvalidQueryDocs()`.
- `src/modules/products/category/product-category.service.ts` — `findAll(dto: FindAllProductCategoriesDto)` resolves `skip` via `resolvePaginationOffset(dto.page, limit)` (`limit = dto.limit ?? PRODUCT_CATEGORY_DEFAULT_LIMIT`), runs `find().sort({ name: 1 }).skip(skip).limit(limit)` alongside `countDocuments()`, returns `{ categories, total }`.
- `src/modules/products/category/product-category.controller.ts` — `findAll(@Query() dto: FindAllProductCategoriesDto)`.

## Docs

- `ai/map.md` — `products/category` row: mention the list endpoint is now paginated (`{ categories, total }`).

## Commit breakdown

1. `docs: spec and plan for unbounded queries and missing indexes (MY-81)` — this file + the spec, alone, before any code.
2. `fix(products): cap ids/excludeIds and paginate findAllByIds`
3. `fix(forms): add createdAt index to newsletter-subscription`
4. `fix(users): add sparse index on resetPasswordToken`
5. `feat(products/category): paginate GET /products/categories`
6. `docs(ai): update map for paginated product categories`

## Verification

- `bun run lint`, `bun run build` after the full sequence.
- Manual reasoning: `GET /products?ids=...` with more ids than `MAX_PRODUCTS_LIMIT` → 400; within the cap, `page`/`limit` slice the ordered result correctly; `GET /products/categories` default call and with `page`/`limit` returns `{ categories, total }`.
