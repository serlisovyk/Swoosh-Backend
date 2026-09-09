# JWT Auth Contract

## Decision

Swoosh Server uses JWT email/password auth with Bearer access tokens and an HttpOnly refresh-token cookie.

## Consequences

- Access tokens are returned in response bodies and sent back through `Authorization: Bearer <token>`.
- Refresh tokens are stored only in the `refreshToken` HttpOnly cookie.
- Refresh tokens are stateless; logout clears the cookie but does not revoke already issued refresh tokens before expiry.
- Server-side auth sessions, OAuth providers, and email verification are intentionally removed.

## Revisit When

- The product needs device management.
- The product needs logout-all.
- The product needs early refresh-token revocation or reuse detection.
- The product needs third-party login again.
