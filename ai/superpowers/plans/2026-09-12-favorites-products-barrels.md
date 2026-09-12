# Plan: index.ts barrels for favorites and products (MY-67)

## Goal

`favorites` and `products` have no `index.ts`, so every cross-module consumer imports deep file
paths instead of a barrel — the only two modules in `src/modules` without one, per
`ai/rules/code-conventions.md` → Imports ("import from the barrel when one exists ... never a deep
path"). No spec — mechanical import-path change, zero behavior change.

## Scope check beyond the issue's bullet list

The issue's "Что сделать" names two files (`auth.service.ts`, and the new `favorites.service.ts` →
`ProductsService` import from MY-58). Its "Готово когда" is broader: *no* import of
`@modules/favorites/...`/`@modules/products/...` deeper than the barrel outside the module itself.
A full repo grep for `@modules/favorites` / `@modules/products` turns up more deep imports than the
two named ones — all of them get routed through the new barrels in this change, since that's what
the acceptance bullet actually requires:

- `auth.module.ts` → `FavoritesModule` (the issue itself anticipates this: "`FavoritesModule`, если
  где-то понадобится импортировать модуль")
- `auth/dto/register.dto.ts`, `auth/dto/login.dto.ts` → four `favorites.constants` error/limit
  constants and `FavoritesOptionalProductIdsPropertyDocs` from `favorites.swagger`
- `user.swagger.ts` → `FavoritesProductIdsPropertyDocs` from `favorites.swagger`
- `favorites.module.ts` → `ProductsModule`
- `favorites.swagger.ts` → `ProductsListItemsPropertyDocs`, `ProductsResponseDocs` from
  `products.swagger`

**Not touched:** `@modules/products/models/product.model` imports (`favorites.utils.ts`,
`favorites.types.ts`, `user.model.ts`) and `@modules/user/models/user.model` equivalents elsewhere —
per `ai/skills/mongoose-models.md`, a model **class** import for typing/`ref:` is a deliberate,
already-documented exception to the barrel rule, not something this issue reopens.

## Barrel contents

`src/modules/favorites/index.ts`:
```ts
export { FavoritesService } from './favorites.service'
export { FavoritesModule } from './favorites.module'
export {
  FAVORITES_MAX_PRODUCT_IDS,
  FAVORITES_PRODUCT_IDS_ARRAY_ERROR,
  FAVORITES_PRODUCT_ID_FORMAT_ERROR,
  FAVORITES_PRODUCT_IDS_MAX_SIZE_ERROR,
} from './favorites.constants'
export {
  FavoritesProductIdsPropertyDocs,
  FavoritesOptionalProductIdsPropertyDocs,
} from './favorites.swagger'
```

`src/modules/products/index.ts`:
```ts
export { ProductsService } from './products.service'
export { ProductsModule } from './products.module'
export { PRODUCT_NOT_FOUND_ERROR } from './products.constants'
export {
  ProductsListItemsPropertyDocs,
  ProductsResponseDocs,
} from './products.swagger'
```

## Consumers to repoint at the barrel

- `auth.service.ts`, `auth.module.ts`
- `auth/dto/register.dto.ts`, `auth/dto/login.dto.ts`
- `user.swagger.ts`
- `favorites.service.ts`, `favorites.module.ts`, `favorites.swagger.ts`

## Commit breakdown

1. `docs: plan for favorites/products barrels (MY-67)` — this file, alone, before any code.
2. `feat(favorites,products): add index.ts barrels` — the two new files, nothing repointed yet.
3. `refactor: import favorites/products through their barrels` — every consumer above switched from
   a deep path to `@modules/favorites` / `@modules/products`.
4. `docs: document the favorites/products barrels in ai/map.md`.

## Verification

- `bun run lint`, `bun run build`.
- Grep for `@modules/favorites/` and `@modules/products/` outside each module's own folder — only
  the documented model-class exceptions should remain.
