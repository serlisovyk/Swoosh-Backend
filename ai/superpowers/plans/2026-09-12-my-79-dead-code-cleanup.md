# Plan: MY-79 — dead SERVER_URL + dead code cleanup

No spec — behavior/public contract does not change. Plan only.

## Note

Rebuilt on top of MY-73 (merged to `main` mid-work, split `AppEnv` into per-domain
files under `src/shared/config/env/`). `SERVER_URL` now lives in `env/app.env.ts`
and `group-env-by-domain.utils.ts`, not the old single `env.config.ts` — updated
below accordingly. Everything else in this plan is unaffected (different files).

## Verified before touching anything

- `SERVER_URL` — grepped `src/`: only declared in `AppConfig` (`src/shared/config/env/app.env.ts:24`) and passed through in `group-env-by-domain.utils.ts:7`, never read via `configService.get` anywhere. `CLIENT_URL` (used in `password-reset.service.ts:26`) stays untouched.
- `ONE_DAY_IN_MS` (`shared/constants/time.constants.ts`) — grepped `src/`: zero importers. `THIRTY_MINUTES_IN_MS`/`ONE_HOUR_IN_MS` from the same file are used elsewhere and stay.
- `ms` — imported directly in `auth.service.ts` (`import ms, { StringValue } from 'ms'`) but absent from `package.json` `dependencies`; resolves today only because `mongoose`/`jsonwebtoken` pull it in transitively (confirmed installed version via `node_modules/ms/package.json`: `2.1.3`). Adding it as a direct dependency, pinned to the range already satisfied.
- `users.swagger.ts:15` — deep-imports `FavoritesProductIdsPropertyDocs` from `@modules/favorites/favorites.swagger`; the symbol is already re-exported by `@modules/favorites`'s barrel (`src/modules/favorites/index.ts`).
- `product-category.constants.ts`'s `updateProductCategoryOptions` is byte-identical to `shared/constants/mongoose.constants.ts`'s `MONGOOSE_UPDATE_AFTER_OPTIONS` (`{ returnDocument: 'after', runValidators: true }`), which `products.service.ts` already imports from `@shared/constants`. Only `product-category.service.ts:54` uses the local one.
- `products.service.ts:39-40` (`productSelectFields`/`categorySelectFields`) and `product-category.service.ts:27` (`selectFields`) are module-private constants declared inline in the class body — `code-conventions.md`'s Constants section requires these in `<feature>.constants.ts`.

## Changes

1. **`src/shared/config/env/app.env.ts`** — remove the `SERVER_URL` field (`@IsUrl` decorator + property) from `AppConfig`. **`src/shared/config/group-env-by-domain.utils.ts`** — drop the `SERVER_URL: config.SERVER_URL` line from the `app` group.
2. **`.env.sample`**, **`.env`** — remove the `SERVER_URL` line from both.
3. **`src/shared/constants/time.constants.ts`** — remove `ONE_DAY_IN_MS`.
4. **`package.json`** — add `"ms": "^2.1.3"` to `dependencies` (alphabetical position, between `mongoose` and `nest-cloudflare-turnstile`).
5. **`src/modules/users/users.swagger.ts`** — change the `FavoritesProductIdsPropertyDocs` import from `@modules/favorites/favorites.swagger` to `@modules/favorites`.
6. **`src/modules/products/category/product-category.constants.ts`** — remove `updateProductCategoryOptions`. **`product-category.service.ts`** — import `MONGOOSE_UPDATE_AFTER_OPTIONS` from `@shared/constants` and use it in `update()` instead.
7. **`src/modules/products/products.constants.ts`** — add `PRODUCT_SELECT_FIELDS = '-__v'` and `PRODUCT_CATEGORY_SELECT_FIELDS = '-__v'`; **`products.service.ts`** — drop the two inline `private readonly` fields, import and use the constants instead.
   **`src/modules/products/category/product-category.constants.ts`** — add `PRODUCT_CATEGORY_SELECT_FIELDS = '-__v'` (own module's constant, not a reuse of the `products` one — `product-category` doesn't import from `products.constants.ts` today and this stays that way); **`product-category.service.ts`** — drop the inline field, import and use it.

Not touched: any endpoint behavior, Swagger response text, public contracts.

## Commit breakdown

1. `docs(ai): plan for MY-79 dead code cleanup` — this file, before any code.
2. `chore(env): drop unused SERVER_URL from schema and env files` — items 1-2.
3. `refactor: remove dead code and fix constants/import placement` — items 3-7.

## Verification

- `bun run lint`
- `bun run build`
- Manual: boot still validates env with `SERVER_URL` absent from `.env`; `/products/categories` update still works (same options object, just re-sourced).
