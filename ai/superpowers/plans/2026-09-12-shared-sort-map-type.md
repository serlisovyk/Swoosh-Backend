# Plan: shared SortMap type (MY-75)

## Context

`Record<string, 1 | -1>` (Mongo sort-map shape) is repeated literally in 7
files, 8 occurrences (verified by grep):

- `shared/types/list-query.types.ts` — 2 occurrences (`sortMap` param, and
  `ResolvedListQueryOptions.sort`)
- `shared/constants/list-query.constants.ts` — 1 (`CREATED_AT_SORT_MAP`'s value type)
- `modules/products/products.types.ts` — 1 (`ProductListQueryOptions.sort`)
- `modules/products/products.constants.ts` — 1 (`PRODUCT_SORT_MAP`'s value type)
- `modules/forms/contact-request/contact-request.types.ts` — 1
- `modules/forms/individual-order/individual-order.types.ts` — 1
- `modules/forms/newsletter-subscription/newsletter-subscription.types.ts` — 1

Pure type-level change — no runtime behavior, no public/data contract change
(the alias expands to the exact same shape). No spec needed, per
`ai/workflow.md` step 5.

## Approach

New `src/shared/types/sort.types.ts`:

```ts
export type SortMap<TKey extends string = string> = Record<TKey, 1 | -1>
```

Placed as its own file (not folded into `list-query.types.ts`) because it is
used outside the list-query feature too (`products`) — a generic type belongs
at the level every consumer can import, same reasoning `code-conventions.md`
already applies to constants.

Replace all 8 occurrences:
- `list-query.types.ts`: `sortMap: Record<TSort, Record<string, 1 | -1>>` →
  `sortMap: Record<TSort, SortMap>`; `sort: Record<string, 1 | -1>` → `sort: SortMap`.
- `list-query.constants.ts`: `CREATED_AT_SORT_MAP: Record<CREATED_AT_SORT_OPTIONS, Record<string, 1 | -1>>`
  → `Record<CREATED_AT_SORT_OPTIONS, SortMap>`.
- `products.types.ts` / `products.constants.ts`: same substitution with
  `PRODUCT_SORT_OPTIONS`.
- The three form modules' `*.types.ts`: `sort: Record<string, 1 | -1>` → `sort: SortMap`
  (default `TKey = string` fits — these are the *resolved* sort object, not
  keyed by the sort-option union).

No behavior change: `SortMap` (default `TKey`) and `SortMap<X>` expand to the
exact same `Record<...>` shapes already in place.

## Commit breakdown

1. **docs**: this plan (single commit, before any code) — no spec (see Context).
2. **refactor(shared/types)**: add `sort.types.ts` + barrel export, replace all
   8 occurrences across the 7 files above. Update `ai/map.md` (new
   `types/sort.types.ts` row).

## Verification

- `bun run lint`, `bun run build`.
- No test suite; a type-alias substitution that changes nothing observable
  is confirmed by `bun run build` passing (any shape mismatch would be a
  compile error, not a silent behavior change).

## Out of scope

- Any change to sort-map *values* or which sort options exist per module —
  purely a type-alias extraction.
