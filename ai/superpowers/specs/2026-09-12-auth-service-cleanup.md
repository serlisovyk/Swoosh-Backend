# Spec: AuthService cleanup (MY-55)

## Why a spec

Two changes here touch a public/security-relevant contract, not just internal tidying:

1. The access-token JWT payload drops its `role` claim.
2. Cookie-setting responsibility moves from `AuthService` to the transport layer.

Neither changes any documented HTTP response shape, but the first changes what's inside an opaque token clients already hold, so it's worth writing down deliberately rather than doing it as a side effect of a refactor.

## Decision: access-token role stays a DB lookup, `role` leaves the payload

Today `AccessTokenPayload` carries `role`, but nothing reads it from the token: `JwtStrategy.validate` loads the user from Mongo by `id` on every request, and `RolesGuard` reads `role` off the DB-loaded `request.user`. The claim is dead weight that looks load-bearing.

Two options exist, per the issue:

- **Trust the token**: `JwtStrategy.validate` stops hitting Mongo, builds `request.user` from the JWT payload directly. Cuts a `findById` per authenticated request, but a banned/demoted user keeps their old role and access until the access token itself expires — this only becomes safe with a short access-token TTL, which is a separate follow-up decision.
- **Keep the DB lookup** (current behavior): `JwtStrategy.validate` keeps loading the user by `id`; `role` is removed from the payload since nothing reads it there.

**Chosen: keep the DB lookup, drop `role` from the payload.** This is a no-behavior-change cleanup — `RolesGuard`/`JwtStrategy` are untouched, only the token's contents shrink. Trusting the token is a real option worth revisiting, but it changes the security model (stale role/ban state until expiry) and needs its own access-token-TTL decision; bundling it into a dead-code cleanup task risks a half-considered security change. Recorded in `ai/decisions/2026-09-12-access-token-role-stays-server-side.md`.

## Change: cookie handling moves out of `AuthService`

`setRefreshTokenCookie` / `clearRefreshTokenCookie` currently live on `AuthService` and import `Response` from `express` — a domain service reasoning about HTTP transport. They move to a new `src/modules/auth/auth.cookies.ts`: plain functions taking a `Response`, the token (or nothing, for clearing), and an options object (`domain`/`secure`/`sameSite`, resolved from `ConfigService` by a third helper in the same file). `AuthController` calls them directly; `AuthService` no longer imports `express` and returns only tokens + `refreshTokenExpiresAt`.

No response body or status code changes. `AuthLogoutDocs` already describes logout as "clears the refresh cookie" with no revocation claim — unaffected.

## Explicitly not in this change

- `POST /auth/login` and `POST /auth/new-tokens` returning `201` instead of the semantically-correct `200` — the issue itself defers this to a coordinated frontend change with its own spec.
- Token revocation / server-side sessions — no decision to add these exists (`ai/decisions/2026-09-09-stateless-refresh-tokens.md`).
- Constant inlining or DTO changes — separate task per the issue.
- Moving auth files between architectural layers — separate task per the issue.
