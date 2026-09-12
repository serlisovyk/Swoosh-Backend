# Spec: split `auth` into layers (MY-54)

Behavior is unchanged (same routes, status codes, response shapes, cookies, tokens). What changes is **where code lives** and **which modules may import from which** — public import paths (`@modules/auth/...` deep imports) and one internal service signature (`UserService.create`). That's why a spec is required per `ai/workflow.md` step 5.

## Target layout

```
src/common/jwt/
  jwt.config.ts        # moved verbatim from modules/auth/jwt.config.ts
  jwt.module.ts         # new — wraps @nestjs/jwt the way captcha/mongo wrap their libs
  index.ts

src/shared/utils/
  crypto.utils.ts        # new — generateToken, hashTokenWithSecret (moved from auth.utils.ts)

src/modules/auth/
  index.ts               # new barrel — Auth, Roles, CurrentUser, JwtAuthGuard, RolesGuard, UserWithoutPassword
  auth.module.ts          # imports JwtModule from @common/jwt instead of registering @nestjs/jwt itself
  auth.controller.ts / auth.service.ts   # unchanged behavior
  auth.swagger.ts        # auth-only operations + property docs, translated to Russian
  auth.constants.ts       # auth-only constants (password-reset-only ones move out)
  auth.types.ts, dto/, guards/, decorators/, strategies/   # unchanged
  password-reset/                          # renamed from auth-account/
    password-reset.controller.ts           # renamed from auth-account.controller.ts
    password-reset.service.ts              # renamed from auth-account.service.ts
    password-reset.swagger.ts              # new — AuthRequestPasswordResetDocs, AuthResetPasswordDocs, AuthResetTokenPropertyDocs, AuthNewPasswordPropertyDocs
    password-reset.constants.ts            # new — its own error texts, RESET_PASSWORD_URL/SUBJECT, its throttle configs, its example
    dto/request-password-reset.dto.ts, dto/reset-password.dto.ts   # same files, updated imports
```

`auth.utils.ts` is deleted (both functions move out).

## Contract changes

- **`UserService.create`**: `create(dto: RegisterDto)` → `create(input: CreateUserInput)`. `CreateUserInput` (new, `src/modules/user/user.types.ts`) has exactly the fields `UserService` reads today: `email`, `password`, `name?`, `phone?`. `AuthService.register` maps `RegisterDto` → `CreateUserInput` before calling it. `user` no longer imports anything from `auth`.
- **Deep imports removed**: `favorites.controller.ts`, `products.controller.ts`, `user.controller.ts`, `contact-request.controller.ts`, `individual-order.controller.ts`, `newsletter-subscription.controller.ts` switch from `@modules/auth/decorators/...` / `@modules/auth/auth.types` to the new `@modules/auth` barrel. Same runtime values, different import path.
- **`auth-account` → `password-reset`**: same two routes (`POST /auth/request-password-reset`, `POST /auth/reset-password`), same `@Controller('auth')` prefix, same `AuthTagDocs()` Swagger tag as `AuthController` — kept deliberately (see Decision below), not moved to a subpath, so the public path/tag doesn't change.
- **Swagger text for the `auth` module becomes Russian** (`auth.swagger.ts` and the new `password-reset.swagger.ts`). Every other module's Swagger stays in English — this is scoped to `auth` only, per the issue.

## Decision: keep `/auth` prefix + tag shared between two controllers

`AuthController` and `PasswordResetController` both declare `@Controller('auth')` and both use `AuthTagDocs()`. The issue asks to consciously choose between leaving this as-is (with a comment) or giving password-reset its own subpath. A subpath (`@Controller('auth/password-reset')`) would change the two public routes to `/auth/password-reset/request-password-reset` etc. — a breaking path change, which contradicts "Готово когда: пути ... те же" for this ticket. **Chosen: keep the shared prefix and tag**, recorded as a decision (`ai/decisions/2026-09-11-password-reset-shares-auth-prefix.md`) rather than an inline comment — no comment on `PasswordResetController` itself, per author feedback that it read as noise.

## What does NOT change

- Token model, cookie policy, throttling values, validation rules, error texts (for the constants that stay in place) — all untouched. This is a pure move/relayer, not a behavior change (MY-53's fixes already landed separately).
- `JwtStrategy` and `PassportModule.register` stay in `auth` (per the issue: they answer a domain question, `common` must not know about `UserService`).
- Guards/decorators stay in `auth`, not `shared` (per the issue: `RolesGuard` is `@Injectable`, and `shared` per MY-44 stays DI-free).
- `ApiValidationErrorDocs()` (MY-59, already landed) — already used in `auth.swagger.ts`; nothing new to generalize here, just relocate the two calls that belong to password-reset.

## Docs to update in the same change

`ai/map.md`, `ai/rules/architecture.md` (library-wrapper-vs-domain layering, no bidirectional module deps), `ai/rules/code-conventions.md` (Swagger docs language), `ai/skills/auth-flow.md`, `ai/skills/module.md`, `ai/skills/swagger-docs.md`, plus a new decision record for the prefix/tag choice and one for the `user`↔`auth` cycle break.
