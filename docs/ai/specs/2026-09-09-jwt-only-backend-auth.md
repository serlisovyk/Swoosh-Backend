# JWT-Only Backend Auth Spec

## Goal

Simplify Swoosh Server auth to email/password JWT auth with a Bearer access token and an HttpOnly refresh-token cookie.

## Scope

In scope:

- return `accessToken` in register, login, and refresh response bodies;
- store only `refreshToken` in an HttpOnly cookie;
- authenticate protected endpoints with `Authorization: Bearer <accessToken>`;
- remove server-side auth sessions, OAuth, and email verification;
- keep password reset unless a later spec removes it;
- keep backend Swagger, environment sample, docs, and skills aligned with the new auth contract.

Out of scope:

- frontend changes;
- frontend token storage;
- root monorepo cleanup unless needed for server-local docs;
- real database destructive cleanup without explicit approval.

## API Contract

- `POST /auth/register` returns `{ user, accessToken }` and sets `refreshToken` cookie.
- `POST /auth/login` returns `{ user, accessToken }` and sets `refreshToken` cookie.
- `POST /auth/new-tokens` reads `refreshToken` from cookies, returns `{ user, accessToken }`, and refreshes the `refreshToken` cookie.
- `POST /auth/logout` clears the `refreshToken` cookie and returns `true`.
- Protected endpoints use Bearer auth.
- Swagger documents Bearer auth for access-protected endpoints and refresh cookie auth only for refresh/logout.

## Data Model

Remove these fields from the user schema and public user contract:

- `googleId`
- `githubId`
- `isEmailVerified`
- `emailVerificationToken`
- `emailVerificationTokenExpiresAt`

Remove the auth sessions collection/model from runtime code.

Existing MongoDB documents need an explicit cleanup path because schema removal does not remove stored fields.

Run `npm run cleanup:auth-simplification` for a dry run. Run `npm run cleanup:auth-simplification -- --apply` only after approving destructive cleanup for the target database.

## Risks

- Stateless refresh tokens cannot be revoked server-side before expiry without adding a blacklist or token version.
- Logout becomes cookie cleanup, not global token invalidation.
- Removing email verification means email ownership is no longer confirmed before profile updates.
- The current frontend will break; that is accepted and intentionally deferred.
