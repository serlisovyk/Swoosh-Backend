# Plan: MY-66 rename `user` module to `users`

No spec — purely internal rename, no public contract change (route stays `/profile`, response shapes unchanged).

## What renames

- Folder: `src/modules/user/` → `src/modules/users/`.
- Files: `user.module.ts` → `users.module.ts`, `user.controller.ts` → `users.controller.ts`, `user.service.ts` → `users.service.ts`, `user.constants.ts` → `users.constants.ts`, `user.types.ts` → `users.types.ts`, `user.swagger.ts` → `users.swagger.ts`.
- Classes: `UserModule` → `UsersModule`, `UserController` → `UsersController`, `UserService` → `UsersService`.
- Swagger exports in `users.swagger.ts` (`UserTagDocs`, `UserResponseDocs`, `UserAddressResponseDocs`, every `User*PropertyDocs`/`User*Docs`) → `Users*` — matches `products.swagger.ts`, where `ProductsResponseDocs` documents a single product but still carries the module's plural prefix. This isn't spelled out file-by-file in the issue, but it's the same "file/module prefix" rule the issue asks to fix, applied to the one file type (`*.swagger.ts`) whose exports weren't listed individually.
- Path alias everywhere: `@modules/user` → `@modules/users`.

## What does not rename

- `models/user.model.ts`, `models/user-address.model.ts` — untouched (file and class).
- Classes `User`, `Address`, `ROLES` — untouched.
- `UserModel` type (`Model<User>`) — stays `UserModel`, not `UsersModel` (matches `ProductModel` staying singular next to `ProductsService`).
- `UserWithoutPassword` in `auth.types.ts` — outside this module, refers to one user, untouched.
- DTOs `UpdateUserDto`, `UpdateAddressDto` — untouched.
- `user.constants.ts`'s `USER_*` constant names — untouched (only the file is renamed to `users.constants.ts`); matches `products.constants.ts` keeping `PRODUCT_*` (entity-scoped) constants singular under a plural file name.
- Local variable/parameter names already using `user`/`userId`/`userModel` (they refer to one user or the Mongoose model) — untouched.

## Commits

### 1. plan (this commit)

### 2. `refactor(users): rename user module to users (folder, files, classes, imports)`

- `git mv` the folder and each renamed file.
- Rename `UserModule`/`UserController`/`UserService` and every Swagger export in the renamed `users.swagger.ts`; update their own internal cross-references (dto files import from `../users.swagger`/`../users.constants`).
- Update every external consumer (path `@modules/user` → `@modules/users`, `UserService`/`UserModule` → `UsersService`/`UsersModule`):
  - `src/app.module.ts`
  - `src/modules/auth/auth.module.ts`, `auth.service.ts`, `auth.types.ts`, `decorators/auth.decorator.ts`, `decorators/roles.decorator.ts`, `guards/roles.guard.ts`, `strategies/jwt.strategy.ts`, `password-reset/password-reset.service.ts`
  - `src/modules/favorites/favorites.module.ts`, `favorites.service.ts`
  - `src/modules/products/products.controller.ts`, `products/category/product-category.controller.ts`
  - `src/modules/forms/contact-request/contact-request.controller.ts`, `forms/individual-order/individual-order.controller.ts`, `forms/newsletter-subscription/newsletter-subscription.controller.ts`
- One commit: splitting folder-rename from import-fixup would leave the build broken in between for no benefit.

### 3. `docs: record users module rename, fix plural/singular naming rule`

- `ai/rules/code-conventions.md` — new Naming bullet: module/service/controller/file-prefix is plural, model/DTO/entity-derived type stays singular, `products`/`users` as the reference pair. Fix the existing `ROLES` path reference (`src/modules/user/user.types.ts` → `src/modules/users/users.types.ts`).
- `ai/map.md` — `user` row → `users` row with new file names; fix the `crypto.utils.ts` row's `user.service.ts` mention.
- `ai/rules/architecture.md` — fix `UserService`/module-name-`user` mentions (no-bidirectional-dependency bullet, cross-module-model-injection bullet).
- `ai/rules/auth-and-api-contracts.md` — fix `UserService.getById` mention.
- `ai/skills/auth-flow.md` — fix the three `UserService`/`src/modules/user/user.types.ts` mentions.
- `ai/skills/mongoose-models.md` — fix `UserService.create`/`UserService` mentions.
- Decision records under `ai/decisions/` are historical and keep the module's name as it was when each decision was written — not touched.

## Verification

- `bun run lint`, `bun run build` — build is what catches a missed import on a rename this wide.
- Manual: `GET`/`PUT /api/v1/profile` behave the same as before (same response shape, same auth requirement).
