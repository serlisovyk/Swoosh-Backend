---
name: query-filters
description: Use when changing Swoosh Server list endpoints, search, pagination, sorting, query DTO transforms, or Mongo query filter builders.
---

# Query Filters

## When to use

Adding or changing a list/search endpoint, a query DTO, pagination, sort, or a Mongo filter builder. Reference implementation: `src/modules/products` (richest example).

## The pipeline (follow it end to end)

1. **DTO parses and normalizes raw query input.** `dto/find-all-<feature>.dto.ts` uses `class-validator` for rules and `@Transform` with the shared helpers from `@shared/utils` (`src/shared/utils/query.utils.ts`):
   - `toStringArrayQueryParam` / `toNumberArrayQueryParam` — split `?x=a,b` and repeated params into arrays.
   - `toBooleanQueryParam` — `"true"`/`"false"` → boolean.
   - `trimStringValue`, `trimStringArrayValue`, `normalizeEmailValue`.
   Do not re-implement these; extend the shared file if a new transform is genuinely reusable.
2. **A pure builder turns the DTO into Mongo query options.** `<feature>.utils.ts` exports `build<Feature>ListQueryOptions(dto)` returning `{ filters, sort, limit, page, ... }` typed in `<feature>.types.ts`. See `buildProductListQueryOptions` in `src/modules/products/products.utils.ts`.
3. **The service runs the query** with those options; it does not parse raw query strings itself.

## Rules

- Parse and validate query input in DTOs / dedicated query helpers, never ad hoc inside services.
- Keep module-specific filter rules inside the module's `*.utils.ts`.
- Sort maps and default limit live in `<feature>.constants.ts` (e.g. `PRODUCT_SORT_MAP`, `DEFAULT_PRODUCTS_LIMIT`); sort option enums in `<feature>.types.ts`. The default limit **value** stays module-specific (18 for products, 12 for favorites, 20 for the three form modules) — only the offset arithmetic and the page default are shared, see below.
- For text search, reuse the shared regex helpers rather than inlining new regex: `escapeRegExp` / `createContainsRegex` / `createExactRegex` / `REGEX_SPECIAL_CHARACTERS` from `@shared/utils` (`src/shared/utils/regex.utils.ts`).
- Never return unbounded lists — always apply pagination.
- Keep the query DTO's Swagger property docs in the module `*.swagger.ts` (see `swagger-docs`), but build them from `QueryPagePropertyDocs({ example, description? })` / `QueryLimitPropertyDocs({ example, maximum, description? })` (`@shared/swagger`) rather than writing a parallel `ApiPropertyOptional` call per module. `description` is optional and defaults to the generic products/favorites wording — pass it when a module's existing wording differs (e.g. "Available only for admins.").

## Pagination: shared arithmetic, module-specific mechanism

- `resolvePaginationOffset(page, limit)` (`@shared/utils`, backed by `DEFAULT_PAGE = 1`) is the one place that turns `page`/`limit` into a skip/offset. Both `products` (Mongo `skip`/`limit`) and `favorites` (in-memory array slice) call it — do not re-derive `(page - 1) * limit` locally.
- This does **not** mean the two modules share a pagination mechanism: `products` still paginates in Mongo, `favorites` still slices an in-memory array of ids (see [decisions/shared-pagination-arithmetic](../decisions/2026-09-11-shared-pagination-arithmetic.md) for why). Only the arithmetic and the "page defaults to 1" rule are shared.
- A module's default `limit` stays in its own `<feature>.constants.ts`; only pass it into `resolvePaginationOffset` and into `QueryLimitPropertyDocs({ example: <the module's default> })`.

## The three form modules (`contact-request`, `individual-order`, `newsletter-subscription`): one shared list-query layer

These three modules use the exact same `NEWEST`/`OLDEST` sort set and the exact same `page`/`limit`/`search` validation, unlike `products`/`favorites` which each have their own sort values. For these three (not `products`):

- Sort enum/map: `CREATED_AT_SORT_OPTIONS` (`@shared/types`) + `CREATED_AT_SORT_MAP` (`@shared/constants`) — do not declare a per-module `<X>_SORT_OPTIONS`/`<X>_SORT_MAP`; only the sort error message stays per module.
- Resolving `skip`/`limit`/`sort`: `resolveListQueryOptions({ page, limit, sort, sortMap: CREATED_AT_SORT_MAP, defaultSort: CREATED_AT_SORT_OPTIONS.NEWEST, defaultLimit: DEFAULT_<X>_LIMIT })` (`@shared/utils`) inside `build<X>ListQueryOptions` — the module's own job stays building `filters` from its real search/status fields.
- DTO: `FindAllXDto extends ListQueryDto` (`@shared/dto`) inherits `search`/`page`/`limit` validators. `page`'s Swagger doc is fully inherited (identical text across all three). `search`/`limit` keep their own module-specific Swagger wording — redeclare the property with `declare` and only the module's own `@X...PropertyDocs()` decorator on top, no repeated `class-validator` decorators (confirmed at runtime: a `declare`-redeclared property with a new, unrelated decorator still runs the base class's `class-validator` rules). `sort` (and, for `individual-order`, `status`) are added fresh in the subclass.
- `findByIdAndUpdate` options: `MONGOOSE_UPDATE_AFTER_OPTIONS` (`@shared/constants`), also used by `products`.

## Verification

- `npm run lint`.
- `npm run build`.
- No test suite; check the built query shape by reasoning, not by adding tests unless asked.
