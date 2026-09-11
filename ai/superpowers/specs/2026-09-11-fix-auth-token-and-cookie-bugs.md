# Spec: fix auth bugs — refresh expiry, unbounded access, reset token, cookies

MY-53 · 2026-09-11

## Why

Review of `src/modules/auth` found six defects: one breaks login right now
(an env-variable split), three are security holes (unbounded access token,
reset token with legacy formats and non-atomic consumption, timing
enumeration), and two are contract bugs (inverted `sameSite`, a registration
race).

## Changed contracts

### 1. Refresh-token lifetime source

- Was: `JWT_REFRESH_TOKEN_EXPIRES_DAYS` (a day count, `getOrThrow`) for the
  cookie + `JWT_REFRESH_TOKEN_EXPIRES_IN` (an `ms`-format string, `get`) for
  signing the JWT — two independent sources, and the first one is missing
  from `.env`.
- Now: only `JWT_REFRESH_TOKEN_EXPIRES_IN` (an `ms`-format string, e.g.
  `"1d"`). The cookie's expiry is computed from the same value via `ms()`.
  Both reads use `getOrThrow`.
- `.env.sample`: drop `JWT_REFRESH_TOKEN_EXPIRES_DAYS` and the dead
  `JWT_ACCESS_TOKEN_EXPIRES_HOURS`.
- The local `.env` already has `JWT_REFRESH_TOKEN_EXPIRES_IN="1d"` — the new
  contract is valid on this stand without any `.env` change.

### 2. `expiresIn` is mandatory for access and refresh tokens

`configService.get` → `configService.getOrThrow` for
`JWT_ACCESS_TOKEN_EXPIRES_IN` and `JWT_REFRESH_TOKEN_EXPIRES_IN`. A missing
key now fails the request (500) instead of issuing a token with no expiry.

### 3. Reset token: HMAC only, atomic consumption

- `findByPasswordResetToken` only looks up by
  `hashTokenWithSecret(token, RESET_TOKEN_SECRET)` — remove the lookup by
  secret-less `sha256` and by the raw token.
- `hashToken` (secret-less sha256) is removed from `auth.utils.ts` — unused
  after this change.
- Lookup and consumption merge into one atomic `findOneAndUpdate`
  (`resetPasswordToken: hashedToken` → `null` +
  `resetPasswordTokenExpiresAt: null`), returning the document **before**
  the update. A second concurrent request with the same token finds no
  match — the first request already cleared it.

### 4. Cookie `sameSite`/`secure` — prod and dev swap

The frontend and API live on different sites (confirmed in the task):

- **Prod** (`isDev` = false): `sameSite: 'none'`, `secure: true` — otherwise
  a cross-site request never carries the cookie.
- **Dev** (`isDev` = true): frontend and API on `localhost` (different
  ports — same site), `sameSite: 'lax'`, `secure: false` — `secure: true`
  over plain http would drop the cookie.

`secure` stops being a hardcoded `true` and depends on `isDev`, same as
`sameSite`.

A new decision record explains why `'none'` in prod is a consequence of
split domains, not carelessness.

### 5. Timing enumeration in `validateUser`

When the user isn't found, run a dummy `argon2.verify` against a constant
hash (not the real password — there is no real hash) before throwing
`UnauthorizedException`. Response time no longer depends on whether the
account exists.

### 6. Registration race

- The unique index on `email` already exists on the `User` schema
  (`src/modules/user/models/user.model.ts:11`, `unique: true, index: true`)
  — nothing to add there.
- `UserService.create`: the `getByEmail` pre-check stays as a fast path
  (without the index, a duplicate would only be caught at write time), plus
  a catch for the duplicate-key error (`code === 11000`) from
  `userModel.create` → `ConflictException(USER_ALREADY_EXISTS_ERROR)`. Of
  two concurrent requests, one succeeds, the other gets a 409 from the
  index instead of a 500.

## Risks / transition period

- Changing `sameSite`/`secure` doesn't break already-issued cookies for
  backward compatibility — the browser simply applies the new attributes to
  the next cookie it sets; old cookies expire on their own `exp`. No special
  migration needed.
- Switching the refresh-cookie's expiry source is an environment-contract
  change: `.env.sample` is updated in the same commit; the local `.env`
  already matches.
- Removing the reset-token's legacy branches invalidates reset links issued
  in the old format before rollout — a 30-minute window (the token's TTL),
  low risk but worth noting.
- The dummy hash check in item 5 uses `argon2.verify` with the same cost
  parameters as the real one — it must not become noticeably faster or
  slower, or the timing signal reappears.

## Out of scope

- Refresh-token revocation / token version / blacklist — a new decision,
  not this task.
- Strengthening password policy.
- Refactoring the module's structure.
- A global `AllExceptionsFilter` for the target error envelope — services
  keep throwing built-in Nest exceptions.
