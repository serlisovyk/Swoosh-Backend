# Auth And API Contract Rules

## Scope

These rules apply to auth behavior, Swagger, public request and response contracts, password reset, cookies, and JWT behavior.

## Auth Model

- The backend uses JWT email/password auth.
- Access tokens are stateless and returned in response bodies from register, login, and refresh endpoints.
- Protected endpoints must read access tokens from `Authorization: Bearer <token>`.
- Refresh tokens are stored in the `refreshToken` HttpOnly cookie.
- Refresh tokens are stateless JWTs signed with `JWT_REFRESH_SECRET`.
- The refresh token's lifetime has one source: `JWT_REFRESH_TOKEN_EXPIRES_IN` (`ms` format, e.g. `"1d"`), read with `getOrThrow`. It signs the JWT and derives the cookie's `expires` date — do not add a second env var for the cookie's lifetime.
- `JWT_ACCESS_TOKEN_EXPIRES_IN` is also read with `getOrThrow`. Never let either token's `expiresIn` fall through to `undefined` — that issues a JWT with no expiry.
- The frontend and this API are served from different sites. The `refreshToken` cookie therefore uses `sameSite: 'none'` + `secure: true` in production (required for the cookie to survive the cross-site refresh request) and `sameSite: 'lax'` + `secure: false` in dev (frontend and API both on `localhost`, over `http`) — see [decisions/refresh-cookie-cross-site-policy](../decisions/2026-09-11-refresh-cookie-cross-site-policy.md).
- `POST /auth/logout` clears the refresh cookie; it does not revoke already issued stateless refresh tokens before expiry.
- Do not add Google/GitHub OAuth, email verification, or server-side auth sessions without a new spec and explicit approval.

## Auth Requests

- Keep login, register, refresh, and logout behavior centered in `src/modules/auth`.
- Keep `POST /auth/new-tokens` reading the refresh token from cookies.
- Keep access-token and refresh-token signing separated: access uses `JWT_SECRET`, refresh uses `JWT_REFRESH_SECRET`.
- Keep Turnstile validation on auth endpoints that accept public credentials.
- Keep auth throttling stricter than global defaults for login, register, request-password-reset, and reset-password.

## Password Reset

- Keep password-reset tokens generated server-side.
- Store password-reset tokens hashed with `hashTokenWithSecret` (HMAC + `RESET_TOKEN_SECRET`) before persistence — this is the only accepted format; do not add a second lookup format "for migration" without a decision record.
- Look up and consume a reset token in a single atomic `findOneAndUpdate` (match on the hashed token + non-expired, clear `resetPasswordToken`/`resetPasswordTokenExpiresAt` in the same operation) so two concurrent requests for the same token cannot both succeed.
- `request-password-reset` should not reveal whether an email exists — including on an email-delivery failure. `EmailService` logs the failure and throws; `AuthAccountService` swallows it and still returns `true`. Never let a send failure change this endpoint's status code or body.
- Keep password-reset DTOs, email template, service behavior, and Swagger docs aligned.

## Public (Unauthenticated) Endpoints

No `@Auth()` decorator, so no access token is required. Kept here as the single inventory — check it before assuming an endpoint is protected:

- `POST /auth/register`, `POST /auth/login`, `POST /auth/new-tokens`, `POST /auth/logout` — auth flow itself.
- `POST /auth/request-password-reset`, `POST /auth/reset-password` — password reset request/confirm.
- `GET /products`, `GET /products/filters`, `GET /products/:id` — public catalog browsing.
- `POST /forms/newsletter-subscriptions`, `POST /forms/individual-orders`, `POST /forms/contact-requests` — public form submission (their `GET`/`PUT`/`DELETE` counterparts are admin-only).
- `GET /` (i.e. `GET /api/v1`), `GET /health` — `system` module; also `@SkipThrottle()`, since uptime monitors would otherwise burn the shared rate limit.

Everything else requires `@Auth()`. This includes `GET /products/categories` (and its `POST`/`PUT`/`DELETE` counterparts, `ROLES.ADMIN`) — it lists every category for admin management, unlike the public `GET /products/filters`, which only surfaces categories that currently have at least one product. Don't merge the two: they serve different purposes and both stay.

## Public API Contracts

- Keep public request and response contracts explicit.
- If request or response shapes change, update Swagger docs in the same change.
- Use Bearer auth in Swagger for protected access-token endpoints.
- Use refresh cookie auth in Swagger only for endpoints that actually read the refresh cookie.
- Do not expose passwords, reset tokens, hashed values, or internal-only fields in public responses or docs.
- The Swagger UI/schema itself (`/api/v1/docs`) is not unconditionally public outside dev — it requires HTTP Basic auth (`SWAGGER_USER`/`SWAGGER_PASSWORD`) unless explicitly turned off with `SWAGGER_ENABLED="false"`. See [decisions/swagger-access-in-prod](../decisions/2026-09-11-swagger-access-in-prod.md).

## Error Response Contract

The canonical error shape for this API — the same shape used across the author's other backends:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "fields": {
      "page": "Invalid input: expected number, received string"
    }
  }
}
```

- `error.code` — a stable, machine-readable code (`VALIDATION_ERROR`, `UNAUTHORIZED`, `NOT_FOUND`, …).
- `error.message` — a short human-readable summary, no internals leaked.
- `error.fields` — per-field messages for field-level validation. Errors about the whole object (not a single field) go under the `_root` key inside `fields`.

**Implemented.** A global `AllExceptionsFilter` (`src/common/errors`) maps every thrown exception — Nest HTTP exceptions, `class-validator` errors, `ThrottlerException`, Passport's `UnauthorizedException` — into this shape and is wired in `main.ts`. Swagger error responses (`ApiBadRequestResponse`, `ApiUnauthorizedResponse`, etc.) document it via `ErrorResponseDocs` from `src/common/errors`.

- Keep throwing built-in Nest HTTP exceptions from services — do **not** hand-roll a different error shape in individual endpoints.
- A field-validation 400 gets `code: "VALIDATION_ERROR"` and a `fields` map; every other 400 (e.g. Turnstile) gets `code: "BAD_REQUEST"` with no `fields`.
