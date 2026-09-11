# Stateless refresh tokens

Date: 2026-09-09 · Status: accepted

## Context

Access tokens need refreshing without any server-side session storage: no session collection, no token version, no blacklist.

## Decision

- Access token — a stateless JWT signed with `JWT_SECRET`, returned in the response body of register / login / new-tokens, read from `Authorization: Bearer <token>`.
- Refresh token — a stateless JWT signed with a **separate** `JWT_REFRESH_SECRET`, stored only in the HttpOnly `refreshToken` cookie.
- `POST /auth/new-tokens` reads the refresh token from the cookie; `POST /auth/logout` clears it.

## Consequences

- Logout clears the cookie but does **not revoke** already-issued refresh tokens before they expire. Never claim revocation exists in docs or Swagger.
- The access and refresh secrets are never shared between the two token types — that separation is part of the decision, not an implementation detail.
- If revocation becomes a requirement, it needs a token version or a blacklist store — that is a **new decision** and a new record here.
- The refresh token's lifetime has a **single source**: `JWT_REFRESH_TOKEN_EXPIRES_IN` (an `ms`-format string, e.g. `"1d"`). It signs the JWT and derives the `refreshToken` cookie's `expires` date — there is no second, independent env var for the cookie's lifetime. Both `JWT_ACCESS_TOKEN_EXPIRES_IN` and `JWT_REFRESH_TOKEN_EXPIRES_IN` are read with `getOrThrow`: a missing key must fail startup/request, not silently issue a token with no expiry.
