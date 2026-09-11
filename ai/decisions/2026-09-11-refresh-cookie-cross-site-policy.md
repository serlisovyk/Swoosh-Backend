# Refresh-cookie `sameSite`/`secure` policy for split frontend/API domains

Date: 2026-09-11 · Status: accepted

## Context

The frontend and this API are served from **different sites** (confirmed,
not colocated on the same domain). Before this change the code had:

```ts
secure: true,
sameSite: isDev(configService) ? 'none' : 'strict',
```

This is inverted for a cross-site setup:

- In production, `sameSite: 'strict'` (or even `'lax'`) blocks the browser
  from sending the `refreshToken` cookie on the cross-site request the SPA
  makes to `POST /auth/new-tokens` — refresh silently fails.
- In dev, `secure: true` + `sameSite: 'none'` requires HTTPS; the local
  frontend and API both run on `http://localhost:<port>`, so the cookie is
  never set at all.

## Decision

- **Production**: `sameSite: 'none'` + `secure: true` — required for the
  cookie to survive a cross-site request; `secure: true` is mandatory
  alongside `'none'` per the cookie spec and is satisfied since production
  runs over HTTPS.
- **Dev**: `sameSite: 'lax'` + `secure: false` — frontend and API both run on
  `localhost` (different ports; a port difference does not change the
  cookie's site), so `'lax'` is enough, and `secure: false` lets the cookie
  be set over plain HTTP.
- `secure` is derived from `isDev(configService)`, not a hardcoded `true`.

This is a consequence of the frontend and API living on separate domains in
production — not a relaxation taken carelessly. If the two are ever moved
onto the same site, this record should be revisited.

## Consequences

- Changing these attributes does not retroactively rewrite cookies already
  set in a user's browser; those expire naturally on their original `exp`.
  No special migration needed.
- If a future frontend deployment moves back onto the same site as the API,
  `'strict'`/`'lax'` in production becomes viable again — update this record
  instead of silently reverting the code.
