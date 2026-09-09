# Auth And API Contract Rules

## Scope

These rules apply to auth behavior, Swagger, public request and response contracts, password reset, cookies, and JWT behavior.

## Auth Model

- The backend uses JWT email/password auth.
- Access tokens are stateless and returned in response bodies from register, login, and refresh endpoints.
- Protected endpoints must read access tokens from `Authorization: Bearer <token>`.
- Refresh tokens are stored in the `refreshToken` HttpOnly cookie.
- Refresh tokens are stateless JWTs signed with `JWT_REFRESH_SECRET`.
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
- Store password-reset tokens hashed before persistence.
- `request-password-reset` should not reveal whether an email exists.
- Keep password-reset DTOs, email template, service behavior, and Swagger docs aligned.

## Public API Contracts

- Keep public request and response contracts explicit.
- If request or response shapes change, update Swagger docs in the same change.
- Use Bearer auth in Swagger for protected access-token endpoints.
- Use refresh cookie auth in Swagger only for endpoints that actually read the refresh cookie.
- Do not expose passwords, reset tokens, hashed values, or internal-only fields in public responses or docs.
