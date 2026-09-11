# Plan: запретить прямой доступ favorites к чужим моделям (MY-58)

Issue: [MY-58](https://linear.app/my-workspace-5105/issue/MY-58/zapretit-pryamoj-dostup-k-chuzhim-modelyam-favorites)
Branch: `serlesovik/my-58-zapretit-pryamoi-dostup-k-chuzhim-modelyam-favorites`

Spec: не требуется — контракт `favorites`-эндпоинтов не меняется, только внутренняя перестройка вызовов.

## Проблема

`FavoritesService` инжектит `@InjectModel(User.name)` и `@InjectModel(Product.name)` и напрямую читает/пишет коллекции, которыми владеют `user` и `products`. Единственный такой случай в репо. Нужно закрыть доступ через публичные методы `UserService`/`ProductsService`.

## Commit breakdown

1. `docs(ai): add plan for MY-58` — этот файл, до кода.
2. `feat(user): add favorites-facing persistence methods to UserService`
   - `getFavoriteProductIdsWithVersion(userId): Promise<{ favoriteProductIds: string[]; version: number } | null>` — `findById(...).select('favoriteProductIds __v').lean()`, `null` если пользователь не найден (NotFound бросает вызывающий код).
   - `updateFavoriteProductIdsIfVersionMatches(userId, version, nextFavoriteProductIds): Promise<string[] | null>` — один атомарный `findOneAndUpdate({ _id: userId, __v: version }, { $set: { favoriteProductIds }, $inc: { __v: 1 } }, { returnDocument: 'after' }).select('favoriteProductIds').lean()`; `null` при несовпадении версии. Не разбивать на read+write.
3. `feat(products): add favorites-facing lookup methods to ProductsService`
   - `existsById(productId): Promise<boolean>` — `productModel.exists({ _id: productId })`.
   - `filterExistingIds(productIds: string[]): Promise<string[]>` — тот же `find({ _id: { $in } }).select('_id').lean()` + `Set`, что сейчас в favorites.
   - `findManyByIds(productIds: string[]): Promise<Product[]>` — тот же `find({ _id: { $in } }).select(this.productSelectFields).populate('category', this.categorySelectFields).lean()`, что использует `findAll` в favorites — сохранить select/populate 1:1.
   - `ProductsModule`: добавить `exports: [ProductsService]`.
4. `refactor(favorites): stop injecting foreign models, use UserService/ProductsService`
   - `FavoritesModule`: убрать `MongooseModule.forFeature([User, Product])`, добавить `imports: [UserModule, ProductsModule]`.
   - `FavoritesService`: конструктор принимает `UserService`, `ProductsService`; убрать оба `@InjectModel`.
   - `findAll` → `productsService.findManyByIds(pageFavoriteProductIds)`.
   - `filterExistingFavoriteProductIds` → `productsService.filterExistingIds(...)`.
   - `ensureProductExists` → `productsService.existsById(...)`.
   - `findUserFavoriteProductIdsOrThrow` / `findUserFavoriteStateOrThrow` → `userService.getFavoriteProductIdsWithVersion(userId)`, throw `NotFoundException(USER_NOT_FOUND_ERROR)` on `null`.
   - `updateFavoriteProductIds` retry loop остаётся в favorites; замена прямого `findOneAndUpdate` на `userService.updateFavoriteProductIdsIfVersionMatches(...)`, `null` → следующая итерация цикла, как сейчас `updatedUser` falsy.
   - Проверка циклических зависимостей: `UserModule`/`ProductsModule` не импортируют `FavoritesModule` — безопасно.
5. `docs(ai): record cross-module model access rule`
   - `ai/skills/mongoose-models.md`: уточнить строку про `@modules/*`-алиас (только класс/типизация/`ref:`), добавить явный запрет DI-инъекции чужой модели.
   - `ai/rules/architecture.md`: секция границ модулей — то же правило, с favorites как примером было/стало.
   - `ai/decisions/2026-09-11-no-cross-module-model-injection.md`: новый record.
   - `ai/map.md`: обновить строку `products` (теперь экспортирует `ProductsService`) и `favorites` (больше не регистрирует чужие схемы).

## Риски / инварианты

- `updateFavoriteProductIdsIfVersionMatches` — один `findOneAndUpdate`, иначе ломается оптимистичная блокировка.
- `select`/`populate`/`lean` в `findManyByIds`/`filterExistingIds` — байт-в-байт как было, иначе `GET /favorites` тихо поменяет поля ответа.
- Поведение публичных `favorites`-эндпоинтов не меняется.

## Проверка

- `npm run lint`
- `npm run build`
- Ручное чтение путей: add/remove/findAll/mergeFavoriteProductIds (вызывается из `auth.service.ts`) — логика не изменилась, только источник данных.
