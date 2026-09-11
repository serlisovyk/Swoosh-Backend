# No cross-module `@InjectModel` — go through the owning service

Date: 2026-09-11 · Status: accepted

## Context

`FavoritesService` injected `@InjectModel(User.name)` and `@InjectModel(Product.name)` — models owned by `user` and `products` — and read/wrote those collections directly, bypassing `UserService`/`ProductsService`. This was previously excused by misreading `ai/skills/mongoose-models.md`'s "cross-module model imports use the `@modules/*` alias" line, which is about importing the model **class** for typing/`ref:`, not about injecting another module's model into a foreign service.

A full sweep of `src/modules` (MY-58) confirmed `favorites` was the only such case — `products`, `user`, and all three `forms/*` sub-modules each inject only their own model.

## Decision

A service injects `@InjectModel` only for models its own module owns. Data owned by another module is read/written only through that module's exported service — never via a direct `@InjectModel` of a foreign model. `UserService`/`ProductsService` stay the single place that knows the shape and invariants of their collections.

`favorites` was fixed as the reference: `UserService` gained `getFavoriteProductIdsWithVersion`/`updateFavoriteProductIdsIfVersionMatches`, `ProductsService` gained `existsById`/`filterExistingIds`/`findManyByIds` (and is now exported from `ProductsModule`), and `FavoritesService`/`FavoritesModule` were rewritten to depend on those services instead of `MongooseModule.forFeature([User, Product])`.

## Consequences

- The narrowly-scoped exception granted in an earlier `favorites` review is revoked and must not be reintroduced — a new cross-module data need gets a new method on the owning service, not a foreign `@InjectModel`.
- `ai/skills/mongoose-models.md` and `ai/rules/architecture.md` now state the rule explicitly, with `favorites` as the before/after example.
- Optimistic-locking primitives that move into an owning service (like `updateFavoriteProductIdsIfVersionMatches`) must stay a single atomic `findOneAndUpdate` — splitting it into read-then-write in the caller reintroduces the race the version check exists to prevent.
