# Plan: MY-74 — inline single-use list-query error constants, relocate DEFAULT_PAGE

No spec: pure internal refactor — no behavior, validation message text, or public contract changes. Verified as part of orientation:

- `LIST_QUERY_SEARCH_STRING_ERROR`, `LIST_QUERY_PAGE_NUMBER_ERROR`, `LIST_QUERY_PAGE_MIN_ERROR`, `LIST_QUERY_LIMIT_NUMBER_ERROR`, `LIST_QUERY_LIMIT_MIN_ERROR`, `LIST_QUERY_LIMIT_MAX_ERROR` (`src/shared/constants/list-query.constants.ts`) are each used exactly once, all in `src/shared/dto/list-query.dto.ts` (grepped).
- `LIST_QUERY_MAX_LIMIT` (same file) is used in 4 places (`list-query.dto.ts` + 3 form modules' Swagger) — stays a shared constant, out of scope.
- `DEFAULT_PAGE` (`src/shared/utils/pagination.utils.ts`) has exactly one consumer: `resolvePaginationOffset` in the same file. Re-exported from `shared/utils/index.ts` but nothing outside `pagination.utils.ts` imports it (grepped `src/modules`).

## Commits

1. **Docs**: this plan, committed alone before code.
2. **Code**:
   - `src/shared/dto/list-query.dto.ts` — replace the 6 imported `LIST_QUERY_*_ERROR` constants with their literal Russian strings inlined directly in the `@IsString`/`@IsInt`/`@Min`/`@Max` decorators (byte-identical text).
   - `src/shared/constants/list-query.constants.ts` — remove the 6 now-unused error constants; add `DEFAULT_PAGE_NUMBER = 1` next to `LIST_QUERY_MAX_LIMIT` (clearer name per the issue, since it now sits among named list-query constants rather than inside a utils file).
   - `src/shared/utils/pagination.utils.ts` — drop the local `DEFAULT_PAGE`, import `DEFAULT_PAGE_NUMBER` from `@shared/constants` instead.
   - `src/shared/utils/index.ts` — drop `DEFAULT_PAGE` from the re-export (only `resolvePaginationOffset` remains from this file).
3. **Docs**: `ai/map.md` — both rows for `constants/list-query.constants.ts` and `utils/pagination.utils.ts` named `DEFAULT_PAGE`/the error texts explicitly; update both to match. (Deviation from the original plan text above, caught while re-checking after implementing — no skill update needed, no pattern reshaped.)

## Verification

- `bun run lint`
- `bun run build`
- Manual check: every inlined message string matches the original constant's value exactly; `resolvePaginationOffset(undefined, limit)` still defaults to page 1.

## Out of scope

- `LIST_QUERY_MAX_LIMIT` — genuinely shared, not touched.
