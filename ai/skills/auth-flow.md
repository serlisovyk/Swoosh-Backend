---
name: auth-flow
description: Use when changing Swoosh Server JWT auth, register/login/logout/refresh behavior, password reset, current-user behavior, auth guards, cookies, or auth Swagger docs.
---

# Auth Flow

## When to use

Any change to auth endpoints, tokens, cookies, guards, roles, password reset, or the current-user decorator. Read `ai/rules/auth-and-api-contracts.md` before touching behavior.

## Endpoints

- `POST /auth/register`, `POST /auth/login`, `POST /auth/new-tokens`, `POST /auth/logout` — `src/modules/auth/auth.controller.ts`.
- `POST /auth/request-password-reset`, `POST /auth/reset-password` — `src/modules/auth/password-reset/password-reset.controller.ts`. Same `/auth` prefix and Swagger tag as `AuthController`, deliberately — see [decisions/password-reset-shares-auth-prefix](../decisions/2026-09-11-password-reset-shares-auth-prefix.md).

All auth orchestration stays under `src/modules/auth`. Other modules reach `Auth`, `Roles`, `CurrentUser`, `JwtAuthGuard`, `RolesGuard`, `UserWithoutPassword` through the module barrel (`@modules/auth`, i.e. `src/modules/auth/index.ts`) — never a deep import.

## Files that move together

- Controllers/services: `auth.controller.ts` + `auth.service.ts`; `password-reset/password-reset.controller.ts` + `password-reset/password-reset.service.ts`.
- Cookies: `auth.cookies.ts` (`buildRefreshTokenCookieOptions`, `setRefreshTokenCookie`, `clearRefreshTokenCookie` — plain functions, no DI). Setting/clearing the refresh cookie is `AuthController`'s job; `AuthService` returns tokens (plus `refreshTokenExpiresAt`) and never imports `express`.
- Request shape: `dto/login.dto.ts`, `dto/register.dto.ts`, `password-reset/dto/request-password-reset.dto.ts`, `password-reset/dto/reset-password.dto.ts`.
- Access-control: `guards/jwt.guard.ts`, `guards/roles.guard.ts`, `strategies/jwt.strategy.ts`, `decorators/auth.decorator.ts`, `decorators/roles.decorator.ts`, `decorators/user.decorator.ts`.
- Config/constants: `auth.constants.ts`, `auth.types.ts`; password-reset-only constants live in `password-reset/password-reset.constants.ts`. The `@nestjs/jwt` library wiring itself (`JwtModule.registerAsync`, its config factory) lives in `src/common/jwt`, not here — `auth.module.ts` just imports it.
- Docs: `auth.swagger.ts` (register/login/new-tokens/logout — in Russian); `password-reset/password-reset.swagger.ts` (its two operations + its property docs — also in Russian).
- Password-reset email: `src/common/email/templates/reset-password.template.tsx` via `src/common/email/email.service.ts`.
- `user.service.ts` accepts `CreateUserInput` (`src/modules/user/user.types.ts`), not `auth`'s `RegisterDto` — `AuthService.register` maps one to the other. `user` never imports from `auth`.

## Token model (do not drift)

- Access token: stateless JWT signed with `JWT_SECRET`, payload is `{ id }` only (no `role` — see below), returned in the response body of register/login/new-tokens, consumed as `Authorization: Bearer <token>` and validated by `jwt.strategy.ts` + `jwt.guard.ts`. `expiresIn` (`JWT_ACCESS_TOKEN_EXPIRES_IN`) is read with `getOrThrow` — never let it fall through to `undefined`, that issues a token with no expiry.
- Refresh token: stateless JWT signed with a **separate** `JWT_REFRESH_SECRET`, stored only in the `refreshToken` HttpOnly cookie. `POST /auth/new-tokens` reads it from the cookie; `POST /auth/logout` clears the cookie.
- The refresh token's lifetime has one source: `JWT_REFRESH_TOKEN_EXPIRES_IN` (`ms` format, e.g. `"1d"`, `getOrThrow`). It signs the JWT and — via `ms()` — derives the cookie's `expires` date. Do not add a second, days-based env var for the cookie.
- The `refreshToken` cookie uses `sameSite: 'none'` + `secure: true` in production and `sameSite: 'lax'` + `secure: false` in dev — the frontend and API are on different sites in production but share `localhost` in dev. See [decisions/refresh-cookie-cross-site-policy](../decisions/2026-09-11-refresh-cookie-cross-site-policy.md).
- Logout does not revoke already-issued refresh tokens before expiry — there is no token version or blacklist. Do not claim otherwise.

## Roles and access control (RBAC)

- `ROLES` lives in `src/modules/user/user.types.ts` and is an **`as const` object with a derived union type**, not a TS `enum`: `{ USER: 'USER', ADMIN: 'ADMIN' }`. It is the single source of roles.
- The user's role is persisted on the `User` model (`role`, defaulted to `ROLES.USER`, indexed) with allowed values from `Object.values(ROLES)`.
- Protect routes with the composite `Auth()` decorator (`decorators/auth.decorator.ts`):
  - `@Auth()` — authentication only: applies `JwtAuthGuard` + `RolesGuard` with no role metadata, so any authenticated user passes.
  - `@Auth(ROLES.ADMIN)` — attaches `Roles(...)` metadata plus both guards.
  - Do not hand-stack `UseGuards(JwtAuthGuard, RolesGuard)` on controllers; use `Auth()`.
- `RolesGuard` reads `roles` metadata via `Reflector.getAllAndOverride` (handler overrides class), allows the request when no roles are required, denies when the request has no `user.role`, and **lets `ROLES.ADMIN` through every role check**. `user.role` comes from `JwtStrategy.validate`'s DB lookup, not from the access-token payload — see [decisions/access-token-role-stays-server-side](../decisions/2026-09-12-access-token-role-stays-server-side.md).
- Consequence: there is no role that admin cannot access. If a route must exclude admins, that needs a different mechanism and a decision record — do not fake it with role lists.
- The current user reaches handlers through the `user` param decorator (`decorators/user.decorator.ts`), populated by `jwt.strategy.ts`. Do not re-read the user from the request object manually.
- Mark role-protected endpoints in Swagger so the required access level is visible (see `swagger-docs`).

## Password reset

- Reset tokens generated server-side (`generateToken`, `src/shared/utils/crypto.utils.ts`) and stored hashed with `hashTokenWithSecret` (same file; HMAC + `RESET_TOKEN_SECRET`) — the only accepted format. There is no legacy/plain fallback; don't reintroduce one without a decision record. Both are plain crypto helpers with no domain meaning — that's why they live in `shared`, not `auth`.
- `UserService.consumePasswordResetToken` finds and clears the token in one atomic `findOneAndUpdate` — the lookup filter and the reset of `resetPasswordToken`/`resetPasswordTokenExpiresAt` happen in the same operation, so two concurrent requests for the same token cannot both succeed.
- `request-password-reset` must not reveal whether an email exists.
- `PasswordResetService.requestPasswordReset` swallows any exception from `EmailService.sendResetPasswordEmail` on purpose and always returns `true`. `EmailService` already logs the failure (recipient, subject, provider error) before throwing `InternalServerErrorException(EMAIL_SEND_FAILED_ERROR)`; letting that exception reach the controller would turn the response into a 500 only when the email exists and Resend fails, which is itself an anti-enumeration leak. Do not remove the `try/catch` to "surface" send failures to the client.
- Keep DTOs, `PasswordResetService`, email template, user token fields, and Swagger in sync in the same change.

## Guardrails

- Keep Turnstile validation on public-credential auth endpoints (`src/common/captcha`).
- Keep auth throttling stricter than global defaults for login, register, request-password-reset, reset-password (`src/common/throttler`).
- Do not reintroduce OAuth, email verification, or server-side auth sessions without an approved spec.

## Verification

- `npm run lint`.
- `npm run build` after contract, dependency, or file-deletion changes.
- No test suite; verify by build + manual reasoning against the rules doc.
