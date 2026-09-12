# Plan: favorites constants cleanup (MY-57)

No spec — behavior and text do not change (per the issue's own "Готово когда").

## Verified against current code before touching anything

The issue was written before two prerequisite tasks landed on `main`: MY-58 (`6a62ed7` — `FavoritesService` stopped injecting foreign models) and MY-59 (`69a3d18` — favorites Swagger switched to shared response helpers). Checked each of the issue's 4 items against the current state:

- **Item 3** (dedup `ApiUnauthorizedResponse`/`ApiNotFoundResponse` in `favorites.swagger.ts`) — already done by MY-59: `FavoritesFindAllDocs`/`FavoritesAddDocs`/`FavoritesRemoveDocs` already call `ApiAuthRequiredDocs()`, and `ApiNotFoundDocs('User')` covers the two identical "User was not found." responses. The one remaining raw `ApiNotFoundResponse({ description: 'User or product was not found.' })` in `FavoritesAddDocs` has different text from the helper's fixed string, so per `ai/skills/swagger-docs.md` it correctly stays a plain call. Nothing to change.
- **Item 4** (inline `productSelectFields`/`categorySelectFields`) — these fields don't exist anymore. MY-58's rewrite moved field-selection ownership into `UserService`/`ProductsService` (favorites no longer touches Mongo directly), so the fields this item targets were already removed as a side effect. Nothing to change.
- **Item 2** (keep `FAVORITES_DEFAULT_LIMIT`, `FAVORITES_MAX_LIMIT`, `FAVORITES_MAX_PRODUCT_IDS`, and the three `FAVORITES_PRODUCT_IDS_*`/`FAVORITES_PRODUCT_ID_FORMAT_ERROR` constants shared with the auth DTOs) — still accurate, still shared with `login.dto.ts`/`register.dto.ts` (MY-56 hasn't landed). Not touched.

**Item 1 is the only remaining actionable item.** Confirmed by grep that all 8 named constants are still confined to exactly one consumer file each:

- `FAVORITES_PAGE_NUMBER_ERROR`, `FAVORITES_PAGE_MIN_ERROR`, `FAVORITES_LIMIT_NUMBER_ERROR`, `FAVORITES_LIMIT_MIN_ERROR`, `FAVORITES_LIMIT_MAX_ERROR` — only `dto/find-all-favorites.dto.ts`.
- `FAVORITES_UPDATE_CONFLICT_ERROR` — only `favorites.service.ts`.
- `FAVORITES_PRODUCT_ID_EXAMPLE`, `FAVORITES_PRODUCT_IDS_EXAMPLE` — only `favorites.swagger.ts` (each used twice within that one file — `FAVORITES_PRODUCT_ID_EXAMPLE` in both `FavoritesAddDocs`/`FavoritesRemoveDocs`, `FAVORITES_PRODUCT_IDS_EXAMPLE` in both product-ids property-docs factories — still "one-off" in the sense `ai/rules/code-conventions.md` → Constants means: local to a single file, not shared across the codebase).

## Commit breakdown

1. `docs(ai): plan for MY-57 favorites constants cleanup` — this file, before any code. Records that items 2-4 are already resolved/moot.
2. `refactor(favorites): inline single-file constants` — remove the 8 constants above from `favorites.constants.ts`, inline their literal values at each call site in `dto/find-all-favorites.dto.ts`, `favorites.service.ts`, `favorites.swagger.ts`. Text stays byte-identical.

No docs beyond the plan: `ai/map.md` doesn't enumerate individual constants, and `ai/rules/code-conventions.md` already states the "inline one-off, keep shared" rule this change follows — nothing to update there.

## Out of scope (per the issue)

- Pagination-formula duplication between `products`/`favorites` (MY-40).
- Optimistic-locking mechanism change (explicitly not needed).
- Moving the `favoriteProductIds` DTO block out of auth (MY-56).

## Verification

- `bun run lint`, `bun run build`.
- Diff `favorites.constants.ts` against its inlined call sites to confirm every error message and Swagger example string is byte-identical before/after.
