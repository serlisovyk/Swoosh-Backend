# Plan: shared list-query helpers for the three form modules (MY-60)

## Goal

`contact-request`, `individual-order`, `newsletter-subscription` duplicate the same regex helpers,
sort enum/map, offset arithmetic, page/limit/search DTO validators, and `findByIdAndUpdate` options.
Extract the identical parts to `shared/`, keep each module's real differences (search fields,
`status` filter, sort error text) local. No spec — public contract, Mongo query shape, and Swagger
schema stay the same; this is a pure refactor.

Depends on MY-40 (done) for `resolvePaginationOffset`/`DEFAULT_PAGE` and the
`QueryPagePropertyDocs`/`QueryLimitPropertyDocs` shared Swagger factories, which this plan builds on
rather than re-deriving.

## New shared building blocks

- `src/shared/utils/regex.utils.ts` — `REGEX_SPECIAL_CHARACTERS`, `escapeRegExp`, `createContainsRegex`,
  `createExactRegex` (moved verbatim from the three form `*.utils.ts` files and from `products.utils.ts`).
- `src/shared/types/list-query.types.ts` (new `shared/types` dir) — `CREATED_AT_SORT_OPTIONS` (`as const`
  + derived union, same pattern as `ROLES`), plus named param/return interfaces for the resolver helper
  below (`ResolveListQueryOptionsParams<TSort>`, `ResolvedListQueryOptions`) per the "no inline object
  type" convention.
- `src/shared/constants/list-query.constants.ts` — `CREATED_AT_SORT_MAP`; the six duplicated error
  messages (`LIST_QUERY_SEARCH_STRING_ERROR`, `LIST_QUERY_PAGE_NUMBER_ERROR`, `LIST_QUERY_PAGE_MIN_ERROR`,
  `LIST_QUERY_LIMIT_NUMBER_ERROR`, `LIST_QUERY_LIMIT_MIN_ERROR`, `LIST_QUERY_LIMIT_MAX_ERROR`);
  `LIST_QUERY_MAX_LIMIT = 100` (identical across all three forms today).
- `src/shared/constants/mongoose.constants.ts` — `MONGOOSE_UPDATE_AFTER_OPTIONS = { returnDocument: 'after', runValidators: true }`.
- `src/shared/utils/list-query.utils.ts` — `resolveListQueryOptions({ page, limit, sort, sortMap, defaultSort, defaultLimit })`
  → `{ skip, limit, sort }`, built on the existing `resolvePaginationOffset`.
- `src/shared/dto/list-query.dto.ts` — `ListQueryDto` base class:
  - `search?: string` — `@IsOptional() @Transform(trim) @IsString(LIST_QUERY_SEARCH_STRING_ERROR)`, no
    Swagger decorator (description differs per module — subclasses add their own).
  - `page?: number` — full validator chain + `QueryPagePropertyDocs({ example: 1, description: 'Results
    page number. Available only for admins.' })`, since this text is byte-identical across all three
    modules today — no subclass override needed.
  - `limit?: number` — full validator chain using `LIST_QUERY_MAX_LIMIT`, no Swagger decorator (the noun
    in the description differs per module — subclasses add their own).
  - Verified pattern: a subclass that extends `ListQueryDto` and redeclares `search`/`limit` with only a
    new `@ApiPropertyOptional`-based decorator (no repeated `class-validator` decorators) still inherits
    and runs the base class's validators — confirmed with a throwaway `class-validator` script before
    committing to this design.
- Small, backward-compatible extension: `QueryPagePropertyDocsOptions`/`QueryLimitPropertyDocsOptions`
  (`src/common/swagger/types/swagger.types.ts`) gain an optional `description?: string`, defaulting to
  the current generic text when omitted (`products`/`favorites` unaffected). This lets forms reuse the
  same shared `QueryPagePropertyDocs`/`QueryLimitPropertyDocs` factories from MY-40 point 5 instead of a
  second parallel helper, while keeping their existing (non-generic, "available only for admins") wording
  byte-for-byte.

## Per-module changes (contact-request, individual-order, newsletter-subscription)

- `<feature>.types.ts` — remove the module's own `<X>_SORT_OPTIONS`; keep `<X>ListQueryOptions` and
  `<X>ListResponse` as-is (not in scope).
- `<feature>.constants.ts` — remove `REGEX_SPECIAL_CHARACTERS`, `<X>_SORT_MAP`, `MAX_<X>_LIMIT`, the six
  page/limit/search error constants, and `update<X>Options`; keep `DEFAULT_<X>_LIMIT` (module-owned
  default value, per `ai/skills/query-filters.md`), `<X>_SORT_ERROR` (sort stays module-specific), and
  all non-list-query constants (name/email/message validation, not-found error, id example).
- `<feature>.utils.ts` — `build<X>ListQueryOptions` keeps building its own `filters` (the real
  difference), then calls `resolveListQueryOptions` for `skip`/`limit`/`sort` instead of re-deriving the
  formula; imports regex helpers from `@shared/utils`.
- `<feature>.swagger.ts` — `<X>QueryPagePropertyDocs` removed (now inherited from `ListQueryDto`);
  `<X>QueryLimitPropertyDocs`/`<X>QuerySearchPropertyDocs` keep their existing module-specific wording but
  call the shared `QueryLimitPropertyDocs` factory instead of `createOptionalPropertyDocsDecorator`
  directly, passing `LIST_QUERY_MAX_LIMIT`.
- `dto/find-all-<x>.dto.ts` — `FindAllXDto extends ListQueryDto`; keeps only what's genuinely its own:
  `sort` (validated against the shared `CREATED_AT_SORT_OPTIONS`, module's own `<X>_SORT_ERROR`), a
  redeclared `search`/`limit` carrying just the module's Swagger decorator, and (individual-order only)
  `status`. `page` is fully inherited, untouched.
- `<feature>.service.ts` — `update<X>Options` → `MONGOOSE_UPDATE_AFTER_OPTIONS` from `@shared/constants`.

## Products (import-only, no behavior change)

- `products.utils.ts` — import `escapeRegExp`/`createContainsRegex`/`createExactRegex`/`REGEX_SPECIAL_CHARACTERS`
  from `@shared/utils` instead of the local copies; delete the local functions.
- `products.constants.ts` — remove `REGEX_SPECIAL_CHARACTERS` and `updateProductOptions`.
- `products.service.ts` — `updateProductOptions` → `MONGOOSE_UPDATE_AFTER_OPTIONS`.
- Product's own sort enum/map, offset arithmetic, and DTO stay untouched (different value set, already
  covered by MY-40).

## Commit breakdown

1. `docs: plan for shared list-query helpers (MY-60)` — this file, alone, before any code.
2. `feat(shared): add list-query helpers (regex, sort map, resolver, base DTO, update options)` — all new
   `shared/` files in one commit; nothing consumes them yet, so `bun run build` must stay green on its own.
3. `refactor(contact-request): use shared list-query helpers`
4. `refactor(individual-order): use shared list-query helpers`
5. `refactor(newsletter-subscription): use shared list-query helpers`
6. `refactor(products): use shared regex helpers and update-options constant`
7. `docs: update map and query-filters skill for the shared list-query layer`

## Verification

- `bun run lint`, `bun run build` after the full sequence.
- Manual reasoning per module: default list call, `search`, `sort=OLDEST`, `page`/`limit` out of range,
  and (individual-order) `status` filter — confirm the built Mongo `filters`/`sort`/`skip`/`limit` match
  what the pre-refactor code produced for the same input.
