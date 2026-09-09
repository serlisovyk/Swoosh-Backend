---
name: query-filters
description: Use when changing Swoosh Server list endpoints, search, pagination, sorting, query DTO transforms, or Mongo query filter builders.
---

# Swoosh Query Filters

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
- Sort maps and default page/limit live in `<feature>.constants.ts` (e.g. `PRODUCT_SORT_MAP`, `DEFAULT_PRODUCTS_LIMIT`); sort option enums in `<feature>.types.ts`.
- For text search, reuse the existing exact/escape-regex helpers rather than inlining new regex (see `createExactRegex` / `REGEX_SPECIAL_CHARACTERS` in products).
- Never return unbounded lists — always apply pagination.
- Keep the query DTO's Swagger property docs in the module `*.swagger.ts` (see `swagger-docs`).

## Verification

- `npm run lint`.
- `npm run build`.
- No test suite; check the built query shape by reasoning, not by adding tests unless asked.
