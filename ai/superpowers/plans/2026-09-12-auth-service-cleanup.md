# Plan: AuthService cleanup (MY-55)

See `ai/superpowers/specs/2026-09-12-auth-service-cleanup.md` for the two decisions this depends on (role removed from access-token payload, cookies move out of the service).

## Current state (confirmed by reading the code)

- `logout(_refreshToken?: string)` returns `true` and does nothing else — dead per `ai/decisions/2026-09-09-stateless-refresh-tokens.md` (no revocation, and none planned without a new decision).
- `createSession(user, _request)` and `getNewTokens(refreshToken, _request)` never use `_request`. Tracing further: `register(dto, request)` and `login(dto, request)` only ever forward `request` into `createSession` — once that param is gone, `request` is dead in `register`/`login` too, and so is `@Req() req` in the controller's `register`/`login` handlers. Cascading the removal is required to keep lint's `no-unused-vars` green, not optional cleanup.
- `generateSessionTokens` computes and returns `refreshTokenExpiresAt`, which `createSession`/`getNewTokens` currently discard. `setRefreshTokenCookie` independently calls the same private `getRefreshTokenExpiresAt()` a second time to get the same value. Fix: keep the one calculation in `generateSessionTokens`, thread its result out through `createSession`/`getNewTokens`/`register`/`login` to the controller, which passes it into the new cookie function — nothing recomputes it.
- `mergeAuthFavorites` spreads a `.lean()` document (`...user`) — checked `USER_PUBLIC_SELECT_FIELDS` / `USER_BASE_SELECT_FIELDS` (`user.constants.ts`): both already exclude `-createdAt -updatedAt -__v`, and `password`/`resetPasswordToken*` are `select: false` on the schema. No internal Mongoose field reaches the response today — no code change needed here, just confirming it in the report.
- `login` / `new-tokens` returning `201` — explicitly deferred per the issue and the spec; not touched.

## Commit breakdown

1. **`docs(ai): spec + plan for MY-55 auth service cleanup`** — this spec + plan, single commit, before any code.
2. **`refactor(auth): drop dead logout/params/duplicate calc, move cookies to auth.cookies.ts`**
   - Delete `AuthService.logout`.
   - Drop the `request`/`_request` parameter from `register`, `login`, `createSession`, `getNewTokens`.
   - `createSession`/`getNewTokens` return `{ user, accessToken, refreshToken, refreshTokenExpiresAt }` (the previously-discarded value now flows out); `getNewTokens` builds its result via `createSession` instead of re-assembling the same shape.
   - New `src/modules/auth/auth.cookies.ts`: `RefreshTokenCookieOptions` type (in `auth.types.ts`, per the no-inline-object-type convention), `buildRefreshTokenCookieOptions(configService)`, `setRefreshTokenCookie(response, refreshToken, expiresAt, options)`, `clearRefreshTokenCookie(response, options)`.
   - Remove `setRefreshTokenCookie`/`clearRefreshTokenCookie` and the `express` import from `AuthService`.
   - `AuthController`: drop `@Req() req` from `register`/`login` (no longer used); gains a `ConfigService` dependency, builds `RefreshTokenCookieOptions` once in the constructor, calls the new cookie functions directly; `logout` handler stops calling `authService.logout(...)` — it already only needs to clear the cookie and return `true`. Sequencing stays identical to today (clear-then-verify-then-set in `new-tokens`; set in `register`/`login`; clear in `logout`).

   Note: originally planned as two commits (dead-code removal, then cookie extraction), but the two touch the same few lines of `auth.controller.ts`/`auth.service.ts` closely enough that splitting them cleanly wasn't worth the churn — merged into one milestone.
3. **`refactor(auth): drop unused role from access-token payload`**
   - Remove `role` from `AccessTokenPayload` (`auth.types.ts`) and from the payload built in `generateSessionTokens`. Drop the now-unused `ROLES` import in `auth.types.ts`.
   - No change to `JwtStrategy` or `RolesGuard` — they already resolve role from the DB-loaded user, not the token.
4. **`docs(ai): document auth service cleanup in decisions/rules/skills/map`**
   - New decision record (see spec).
   - `ai/rules/auth-and-api-contracts.md`: note the access-token payload carries only `id`; logout behavior unchanged (still just clears the cookie).
   - `ai/skills/auth-flow.md`: update "Files that move together" to include `auth.cookies.ts`; note cookie-setting is a controller responsibility now; note role comes from the DB-loaded user, never the token.
   - `ai/map.md`: add `auth.cookies.ts` to the `auth` module's entry files.

## Out of scope

- `login`/`new-tokens` 201 → 200 (needs frontend coordination + its own spec, per the issue).
- Token revocation / server-side sessions.
- Constant inlining, DTO changes, moving files between architectural layers.

## Verification

- `bun run lint`, `bun run build`.
- Manual reasoning: register → login → new-tokens → logout token/cookie flow unchanged; protected endpoint still resolves role from DB via `JwtStrategy`.
