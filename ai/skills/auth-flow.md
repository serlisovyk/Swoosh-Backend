---
name: auth-flow
description: Use when changing Swoosh Server JWT auth, register/login/logout/refresh behavior, password reset, current-user behavior, auth guards, cookies, or auth Swagger docs.
---

# Auth Flow

## When to use

Any change to auth endpoints, tokens, cookies, guards, roles, password reset, or the current-user decorator. Read `ai/rules/auth-and-api-contracts.md` before touching behavior.

## Endpoints

- `POST /auth/register`, `POST /auth/login`, `POST /auth/new-tokens`, `POST /auth/logout` — `src/modules/auth/auth.controller.ts`.
- `POST /auth/request-password-reset`, `POST /auth/reset-password` — `src/modules/auth/auth-account/auth-account.controller.ts`.

All auth orchestration stays under `src/modules/auth`.

## Files that move together

- Controllers/services: `auth.controller.ts` + `auth.service.ts`; `auth-account/auth-account.controller.ts` + `auth-account.service.ts`.
- Request shape: `dto/login.dto.ts`, `dto/register.dto.ts`, `auth-account/dto/request-password-reset.dto.ts`, `auth-account/dto/reset-password.dto.ts`.
- Access-control: `guards/jwt.guard.ts`, `guards/roles.guard.ts`, `strategies/jwt.strategy.ts`, `decorators/auth.decorator.ts`, `decorators/roles.decorator.ts`, `decorators/user.decorator.ts`.
- Config/constants: `jwt.config.ts`, `auth.constants.ts`, `auth.types.ts`, `auth.utils.ts`.
- Docs: `auth.swagger.ts`.
- Password-reset email: `src/common/email/templates/reset-password.template.tsx` via `src/common/email/email.service.ts`.

## Token model (do not drift)

- Access token: stateless JWT signed with `JWT_SECRET`, returned in the response body of register/login/new-tokens, consumed as `Authorization: Bearer <token>` and validated by `jwt.strategy.ts` + `jwt.guard.ts`.
- Refresh token: stateless JWT signed with a **separate** `JWT_REFRESH_SECRET`, stored only in the `refreshToken` HttpOnly cookie. `POST /auth/new-tokens` reads it from the cookie; `POST /auth/logout` clears the cookie.
- Logout does not revoke already-issued refresh tokens before expiry — there is no token version or blacklist. Do not claim otherwise.

## Roles and access control (RBAC)

- `ROLES` lives in `src/modules/user/user.types.ts` and is an **`as const` object with a derived union type**, not a TS `enum`: `{ USER: 'USER', ADMIN: 'ADMIN' }`. It is the single source of roles.
- The user's role is persisted on the `User` model (`role`, defaulted to `ROLES.USER`, indexed) with allowed values from `Object.values(ROLES)`.
- Protect routes with the composite `Auth()` decorator (`decorators/auth.decorator.ts`):
  - `@Auth()` — authentication only: applies `JwtAuthGuard` + `RolesGuard` with no role metadata, so any authenticated user passes.
  - `@Auth(ROLES.ADMIN)` — attaches `Roles(...)` metadata plus both guards.
  - Do not hand-stack `UseGuards(JwtAuthGuard, RolesGuard)` on controllers; use `Auth()`.
- `RolesGuard` reads `roles` metadata via `Reflector.getAllAndOverride` (handler overrides class), allows the request when no roles are required, denies when the request has no `user.role`, and **lets `ROLES.ADMIN` through every role check**.
- Consequence: there is no role that admin cannot access. If a route must exclude admins, that needs a different mechanism and a decision record — do not fake it with role lists.
- The current user reaches handlers through the `user` param decorator (`decorators/user.decorator.ts`), populated by `jwt.strategy.ts`. Do not re-read the user from the request object manually.
- Mark role-protected endpoints in Swagger so the required access level is visible (see `swagger-docs`).

## Password reset

- Reset tokens generated server-side and stored **hashed** before persistence.
- `request-password-reset` must not reveal whether an email exists.
- Keep DTOs, `AuthAccountService`, email template, user token fields, and Swagger in sync in the same change.

## Guardrails

- Keep Turnstile validation on public-credential auth endpoints (`src/common/captcha`).
- Keep auth throttling stricter than global defaults for login, register, request-password-reset, reset-password (`src/common/throttler`).
- Do not reintroduce OAuth, email verification, or server-side auth sessions without an approved spec.

## Verification

- `npm run lint`.
- `npm run build` after contract, dependency, or file-deletion changes.
- No test suite; verify by build + manual reasoning against the rules doc.
