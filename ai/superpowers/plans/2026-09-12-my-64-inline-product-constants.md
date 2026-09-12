# Plan: Inline one-off product constants, add MAX_PRODUCTS_LIMIT, document ids pagination

Linear: MY-64

No spec — this is a non-behavioral cleanup (same rule already applied to
`auth`/MY-56, `favorites`/MY-57, `forms`/MY-61). The only observable change is
the max-limit error text going from a literal `100` to an interpolated
`${MAX_PRODUCTS_LIMIT}` (same displayed value), plus an added Swagger
description sentence.

## Baseline check (before writing this plan)

MY-60 and MY-62 are both merged into `main` already, so:
- `REGEX_SPECIAL_CHARACTERS` and `updateProductOptions` are already gone from
  `products.constants.ts` (moved to `@shared` by MY-60).
- `PRODUCT_CATEGORY_NAME_STRING_ERROR`/`PRODUCT_CATEGORY_NAME_EMPTY_ERROR`/
  `PRODUCT_CATEGORY_NOT_FOUND_ERROR` are already gone (moved to
  `category/product-category.constants.ts` by MY-62).

So the constants list in the issue description is stale on those three; this
plan works from the current file, not the issue's snapshot.

## Rule applied

Audited every export in `products.constants.ts` by actual occurrence count
(grep across `src/`, each usage line counted, not just files):

- **Inline** (single occurrence, and it's a DTO-decorator validation message
  in `create-product.dto.ts` / `create-product-color.dto.ts` /
  `find-all-products.dto.ts`): all `PRODUCT_*_ERROR` for
  title/price/description/images/oldPrice/saleCF/sizes/material/isHit/
  isNewArrival/colors/categoryId, and all `PRODUCT_QUERY_*_ERROR` except the
  two below. Also `PRODUCT_IMAGE_EXAMPLES` (single-use Swagger example array,
  per code-conventions "inline one-off ... examples when only used locally").
- **Keep as constants** — genuinely reused (2+ occurrences), or a
  service-thrown error (not a DTO message — same precedent as
  `FAVORITES_UPDATE_CONFLICT_ERROR`, which stayed a constant despite being
  single-use, because it's thrown from a service, not a DTO validator):
  - `PRODUCT_NOT_FOUND_ERROR` — service, reused by `favorites.service.ts` too.
  - `PRODUCT_OLD_PRICE_LOWER_THAN_PRICE_ERROR`,
    `PRODUCT_SALE_CF_REQUIRES_OLD_PRICE_ERROR` — service-thrown, not DTO
    messages; same precedent as above.
  - `PRODUCT_QUERY_IDS_ARRAY_ERROR`, `PRODUCT_QUERY_IDS_FORMAT_ERROR` — each
    genuinely used twice in `find-all-products.dto.ts` (`ids` and
    `excludeIds` fields).
  - `PRODUCT_QUERY_LIMIT_MAX_ERROR` — new: derived from `MAX_PRODUCTS_LIMIT`
    via template literal, kept as its own named constant next to it — same
    shape as `FAVORITES_LIMIT_MAX_ERROR`/`FAVORITES_MAX_LIMIT` in
    `favorites.constants.ts`.
  - `DEFAULT_PRODUCTS_LIMIT`, `PRODUCT_SORT_MAP`, `PRODUCT_ID_EXAMPLE` (7
    occurrences in `products.swagger.ts`), `PRODUCT_CATEGORY_ID_EXAMPLE` (used
    in both `products.swagger.ts` and `category/product-category.swagger.ts`),
    `FILTERS_METADATA_CACHE_TTL_MS` (a config value, not repeated text).

## Commit breakdown

1. **docs(ai): plan for MY-64 inline product constants** — this plan, alone
   (no spec), before any code.

2. **refactor(products): inline one-off constants, add MAX_PRODUCTS_LIMIT,
   document ids pagination** — kept as one commit rather than two: the
   inlining pass and the `MAX_PRODUCTS_LIMIT` change both land in
   `products.constants.ts`/`find-all-products.dto.ts`/`products.swagger.ts`,
   and splitting them would mean committing an artificial in-between state
   with the old `100` literal still duplicated. One commit, same net diff:
   - `create-product.dto.ts`, `create-product-color.dto.ts`,
     `find-all-products.dto.ts` — inline the messages listed above directly
     into each decorator.
   - `products.swagger.ts` — inline `PRODUCT_IMAGE_EXAMPLES` into
     `ProductsImagesPropertyDocs`'s `example`.
   - `products.constants.ts` — remove every constant that moved inline; add
     `MAX_PRODUCTS_LIMIT = 100`; change `PRODUCT_QUERY_LIMIT_MAX_ERROR` to
     interpolate it (`` `Лимит должен быть не больше ${MAX_PRODUCTS_LIMIT}` ``)
     instead of the literal `100` in the string.
   - `find-all-products.dto.ts` — `@Max(100, ...)` → `@Max(MAX_PRODUCTS_LIMIT, ...)`.
   - `products.swagger.ts` — `ProductsQueryLimitPropertyDocs`'s
     `maximum: 100` → `maximum: MAX_PRODUCTS_LIMIT` (keeps the documented max
     in sync with the validator instead of drifting).
   - `products.swagger.ts` — `ProductsFindAllDocs()`'s `ApiOperation.description`
     gets one added sentence: passing `ids` ignores `page`/`limit`/`sort` and
     returns every match in `ids`' order.

## Verification

- `bun run lint`
- `bun run build`
- Diff every remaining validation-error string against its pre-change text —
  byte-for-byte identical except the interpolated limit number (still `100`).
- Manual check: `GET /products?ids=...&page=2&limit=5` still returns all
  matches in `ids` order (unchanged behavior, only now documented).
