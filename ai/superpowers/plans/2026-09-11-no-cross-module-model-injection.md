# Plan: stop favorites from accessing foreign models directly (MY-58)

Issue: [MY-58](https://linear.app/my-workspace-5105/issue/MY-58/zapretit-pryamoj-dostup-k-chuzhim-modelyam-favorites)
Branch: `my-58-no-cross-module-model-injection`

Spec: not needed — the `favorites` endpoint contract does not change, only the internal call structure.

## Problem

`FavoritesService` injects `@InjectModel(User.name)` and `@InjectModel(Product.name)` — models owned by `user` and `products` — and reads/writes those collections directly. This is the only such case in the repo. Close it via the owning services' public methods.

## Commit breakdown

1. `docs(ai): add plan for MY-58` — this file, before code.
2. `feat(user): add favorites-facing persistence methods to UserService`
   - `getFavoriteProductIdsWithVersion(userId): Promise<{ favoriteProductIds: string[]; version: number } | null>` — `findById(...).select('favoriteProductIds __v').lean()`, `null` when the user is not found (the caller throws NotFound).
   - `updateFavoriteProductIdsIfVersionMatches(userId, version, nextFavoriteProductIds): Promise<string[] | null>` — one atomic `findOneAndUpdate({ _id: userId, __v: version }, { $set: { favoriteProductIds }, $inc: { __v: 1 } }, { returnDocument: 'after' }).select('favoriteProductIds').lean()`; `null` on version mismatch. Do not split into read+write.
3. `feat(products): add favorites-facing lookup methods to ProductsService`
   - `existsById(productId): Promise<boolean>` — `productModel.exists({ _id: productId })`.
   - `filterExistingIds(productIds: string[]): Promise<string[]>` — the same `find({ _id: { $in } }).select('_id').lean()` + `Set` favorites currently does.
   - `findManyByIds(productIds: string[]): Promise<Product[]>` — the same `find({ _id: { $in } }).select(this.productSelectFields).populate('category', this.categorySelectFields).lean()` that favorites' `findAll` uses — keep select/populate identical.
   - `ProductsModule`: add `exports: [ProductsService]`.
4. `refactor(favorites): stop injecting foreign models, use UserService/ProductsService`
   - `FavoritesModule`: drop `MongooseModule.forFeature([User, Product])`, add `imports: [UserModule, ProductsModule]`.
   - `FavoritesService`: constructor takes `UserService`, `ProductsService`; drop both `@InjectModel`.
   - `findAll` → `productsService.findManyByIds(pageFavoriteProductIds)`.
   - `filterExistingFavoriteProductIds` → `productsService.filterExistingIds(...)`.
   - `ensureProductExists` → `productsService.existsById(...)`.
   - `findUserFavoriteProductIdsOrThrow` / `findUserFavoriteStateOrThrow` → `userService.getFavoriteProductIdsWithVersion(userId)`, throw `NotFoundException(USER_NOT_FOUND_ERROR)` on `null`.
   - `updateFavoriteProductIds` retry loop stays in favorites; the direct `findOneAndUpdate` is replaced by `userService.updateFavoriteProductIdsIfVersionMatches(...)`, `null` moves to the next loop iteration exactly as a falsy `updatedUser` did before.
   - Circular-dependency check: neither `UserModule` nor `ProductsModule` imports `FavoritesModule` — safe to add.
5. `docs(ai): record cross-module model access rule`
   - `ai/skills/mongoose-models.md`: clarify the `@modules/*`-alias line (class import / typing / `ref:` only), add an explicit ban on injecting a foreign model.
   - `ai/rules/architecture.md`: module-boundaries section — the same rule, with favorites as the before/after example.
   - `ai/decisions/2026-09-11-no-cross-module-model-injection.md`: new record.
   - `ai/map.md`: update the `products` line (now exports `ProductsService`) and `favorites` (no longer registers foreign schemas).

## Risks / invariants

- `updateFavoriteProductIdsIfVersionMatches` must stay one `findOneAndUpdate`, or optimistic locking breaks.
- `select`/`populate`/`lean` in `findManyByIds`/`filterExistingIds` must match the previous favorites code byte-for-byte, or `GET /favorites` silently changes response fields.
- Public `favorites` endpoint behavior does not change.

## Verification

- `npm run lint`
- `npm run build`
- Manual read-through of add/remove/findAll/mergeFavoriteProductIds (called from `auth.service.ts`) — logic unchanged, only the data source moved.
