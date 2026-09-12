# Access-token role stays server-side (DB lookup), not trusted from the JWT payload

Date: 2026-09-12 · Status: accepted

## Context

`AccessTokenPayload` carried a `role` claim that nothing read: `JwtStrategy.validate` already loads the user from Mongo by `id` on every authenticated request, and `RolesGuard` reads `role` off that DB-loaded `request.user`, never off the token. That's a `findById` per request for data the token already had — but fixing the redundancy has two opposite directions, and doing neither on purpose is what MY-55 flagged.

## Decision

Keep the DB lookup in `JwtStrategy.validate` as the source of role/user state on every request. Remove `role` from `AccessTokenPayload` — the access token now carries only `id`.

The alternative (drop the DB lookup, build `request.user` from the token payload) was rejected for now: it would let a banned or demoted user keep their old role/access until the access token itself expires, which only becomes an acceptable tradeoff with a short access-token TTL — a separate decision this task didn't set out to make. Trusting the token stays on the table as a future change, but it needs its own TTL decision, not a side effect of a dead-code cleanup.

## Consequences

- No behavior change: `RolesGuard`/`JwtStrategy` are untouched, a role/ban change still takes effect on the next request (bounded by nothing but the request itself, not the access-token TTL).
- The access token's JWT payload shape changes (`role` no longer present) — not a documented public response field, but any client inspecting the token's claims directly would see the difference.
- Revisiting "trust the token" later needs: a short `JWT_ACCESS_TOKEN_EXPIRES_IN`, re-adding `role` (and any other guard-relevant fields) to the payload, and its own decision record — do not half-do it by re-adding `role` without also dropping the DB lookup.
