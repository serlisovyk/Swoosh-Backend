# Plan: split `auth` into layers (MY-54)

See spec: [2026-09-11-auth-layers.md](../specs/2026-09-11-auth-layers.md)

## Commit breakdown

1. **`docs(ai): spec + plan for splitting auth into layers (MY-54)`** — this spec + plan. No code.
2. **`feat(jwt): extract JwtModule library wrapper into common/jwt`**
   - New `src/common/jwt/{jwt.config,jwt.module,index}.ts` (same pattern as `src/common/captcha`).
   - `auth.module.ts`: import `JwtModule` from `@common/jwt` instead of calling `JwtModule.registerAsync` itself; delete the now-unused `jwt.config.ts` import.
   - Delete `src/modules/auth/jwt.config.ts`.
3. **`refactor(auth,user): move crypto helpers to shared, drop user→auth import`**
   - New `src/shared/utils/crypto.utils.ts` (`generateToken`, `hashTokenWithSecret`), exported from `src/shared/utils/index.ts`.
   - Delete `src/modules/auth/auth.utils.ts`.
   - `user.service.ts`: import `hashTokenWithSecret` from `@shared/utils` instead of `@modules/auth/auth.utils`.
   - `auth-account.service.ts` (not yet renamed at this point): import `generateToken` from `@shared/utils`.
   - `user.types.ts`: add `CreateUserInput` (`email`, `password`, `name?`, `phone?`).
   - `user.service.ts`: `create(dto: RegisterDto)` → `create(input: CreateUserInput)`, use `input.*` instead of `dto.*`; drop the `RegisterDto` import.
   - `auth.service.ts`: `register()` maps `RegisterDto` → `CreateUserInput` before calling `userService.create(...)`.
4. **`feat(auth): add module barrel, redirect external deep imports`**
   - New `src/modules/auth/index.ts` exporting `Auth`, `Roles`, `CurrentUser`, `JwtAuthGuard`, `RolesGuard`, and the `UserWithoutPassword` type.
   - Update imports in `favorites.controller.ts`, `products.controller.ts`, `user.controller.ts`, `contact-request.controller.ts`, `individual-order.controller.ts`, `newsletter-subscription.controller.ts` to import from `@modules/auth` instead of the deep paths.
5. **`refactor(auth): rename auth-account to password-reset, split its swagger/constants out`**
   - `git mv` the folder and its two files (`auth-account.controller.ts` → `password-reset.controller.ts`, `auth-account.service.ts` → `password-reset.service.ts`), rename the classes (`AuthAccountController` → `PasswordResetController`, `AuthAccountService` → `PasswordResetService`).
   - New `password-reset/password-reset.constants.ts`: move the password-reset-only constants out of `auth.constants.ts` (`TOKEN_NOT_EMPTY_ERROR`, `TOKEN_STRING_ERROR`, `INVALID_OR_EXPIRED_PASSWORD_RESET_TOKEN_ERROR`, `RESET_PASSWORD_URL`, `RESET_PASSWORD_SUBJECT`, `AUTH_PASSWORD_RESET_REQUEST_THROTTLE`, `AUTH_PASSWORD_RESET_THROTTLE`, `AUTH_RESET_TOKEN_EXAMPLE`) — names unchanged, only location. Constants still shared with the parent auth DTOs (`EMAIL_VALIDATION_ERROR`, `PASSWORD_STRING_ERROR`, `PASSWORD_MIN_LENGTH_ERROR`) stay in `auth.constants.ts`.
   - New `password-reset/password-reset.swagger.ts`: move `AuthRequestPasswordResetDocs`, `AuthResetPasswordDocs`, `AuthResetTokenPropertyDocs`, `AuthNewPasswordPropertyDocs` out of `auth.swagger.ts` — names unchanged. `AuthTagDocs` stays in `auth.swagger.ts`; the new controller imports it from there.
   - Update `dto/reset-password.dto.ts`'s imports to the new locations; `dto/request-password-reset.dto.ts` keeps importing from `auth.swagger`/`auth.constants` (its property doc and constant are shared with register/login, they don't move).
   - Add the "why this shares `/auth`" comment on `PasswordResetController` (see spec's Decision section).
   - `auth.module.ts`: update controller/service imports and names.
   - Translate the remaining `auth.swagger.ts` (property docs + operation docs for register/login/new-tokens/logout) to Russian; translate the new `password-reset.swagger.ts` to Russian too (it's part of the same module).
6. **`docs(ai): document the new auth layout and layering rules`**
   - `ai/map.md`: `common/jwt`, `shared/utils/crypto.utils.ts`, `password-reset/` under auth, the barrel.
   - `ai/rules/architecture.md`: where a library wrapper belongs vs. domain logic (using `common/jwt` as the example); no bidirectional module dependency (using the `user`↔`auth` cycle that was just broken as the example).
   - `ai/rules/code-conventions.md`: Swagger docs language rule (Russian, rolling out per-module) + barrel-import rule extended to feature modules, not just `common`/`shared`.
   - `ai/skills/auth-flow.md`: new file list, `CreateUserInput`, the barrel.
   - `ai/skills/module.md`, `ai/skills/swagger-docs.md`: path/example touch-ups.
   - New decision records: `ai/decisions/2026-09-11-no-user-auth-cycle.md` (the `CreateUserInput` approach), `ai/decisions/2026-09-11-password-reset-shares-auth-prefix.md` (the prefix/tag choice).

## Verification

- `bun run lint`, `bun run build` after every commit that touches imports (2, 3, 4, 5).
- Manual: start the dev server, exercise register, login, new-tokens, logout, request-password-reset, reset-password, and one endpoint from each of the 6 modules whose import changed (to catch a broken `Auth()`/`CurrentUser()` wiring) — compare responses/behavior against what they were before.
- Read `/api/v1/docs` and confirm the Auth group still shows both sets of operations, now in Russian.

## Explicitly not doing

- No behavior change to tokens, cookies, throttling, or validation rules.
- Not moving guards/decorators to `shared`.
- Not renaming `AuthRequestPasswordResetDocs`/`AuthResetPasswordDocs`/`AuthResetTokenPropertyDocs`/`AuthNewPasswordPropertyDocs` — only relocating them.
- Not touching any Swagger outside the `auth` module (no translation of other modules).
- Not giving password-reset its own route subpath.
