# Plan: MY-53 — auth bugs

Spec: `ai/superpowers/specs/2026-09-11-fix-auth-token-and-cookie-bugs.md`

## Commit 0 (this one) — spec + plan

One commit, before code.

## Commit 1 — single source for refresh-token expiry + mandatory `expiresIn`

Files: `src/modules/auth/auth.service.ts`, `.env.sample`.

- `setRefreshTokenCookie` and `getRefreshTokenExpiresAt`: drop
  `JWT_REFRESH_TOKEN_EXPIRES_DAYS` / `ONE_DAY_IN_MS`, compute expiry via
  `ms(configService.getOrThrow<StringValue>('JWT_REFRESH_TOKEN_EXPIRES_IN'))`.
- `generateSessionTokens`: `get` → `getOrThrow` for
  `JWT_ACCESS_TOKEN_EXPIRES_IN` and `JWT_REFRESH_TOKEN_EXPIRES_IN`.
- One helper `getRefreshTokenExpiresInMs()` reused by both the JWT signing
  call and `getRefreshTokenExpiresAt`, so the variable isn't read twice with
  a different cast.
- `.env.sample`: drop `JWT_REFRESH_TOKEN_EXPIRES_DAYS`,
  `JWT_ACCESS_TOKEN_EXPIRES_HOURS`.

## Commit 2 — cookie `sameSite`/`secure` for split domains

Files: `src/modules/auth/auth.service.ts`.

- `defaultCookieOptions`: `secure: !isDev(configService)`,
  `sameSite: isDev(configService) ? 'lax' : 'none'`.

## Commit 3 — reset token: HMAC only, atomic consumption

Files: `src/modules/user/user.service.ts`, `src/modules/auth/auth.utils.ts`,
`src/modules/auth/auth-account/auth-account.service.ts`.

- Rename `findByPasswordResetToken` to `consumePasswordResetToken` (finds
  and immediately clears via `findOneAndUpdate`, matching
  `resetPasswordToken: hashedToken` and setting `resetPasswordToken: null,
resetPasswordTokenExpiresAt: null`); drop `legacyHashedToken` / the raw
  `token` from the filter.
- `AuthAccountService.resetPassword`: calls `consumePasswordResetToken`,
  then passes `newPassword` to `resetPassword(userId, newPassword)` as
  before (which now just hashes and writes the password — the token was
  already cleared in the previous step, so it doesn't need to null it
  again).
- Remove `hashToken` from `auth.utils.ts`.

## Commit 4 — timing enumeration in login

Files: `src/modules/auth/auth.service.ts`, `src/modules/auth/auth.constants.ts`.

- A constant dummy hash (generated once with `argon2.hash` against a fixed
  string, hardcoded as a constant — computed once at commit time, not per
  request) in `auth.constants.ts`.
- `validateUser`: when the user isn't found — `await
verify(DUMMY_PASSWORD_HASH, password)` before the `throw`, result discarded
  (`noop`).

## Commit 5 — 409 on registration race

Files: `src/modules/user/user.service.ts`.

- `create`: wrap `userModel.create` in `try/catch`, on `error.code === 11000`
  throw `ConflictException(USER_ALREADY_EXISTS_ERROR)`, otherwise rethrow.

## Commit 6 — documentation

- `ai/decisions/`: new record — `sameSite: 'none'`/`secure: true` in prod is
  a consequence of the frontend and API being on separate domains.
- `ai/decisions/2026-09-09-stateless-refresh-tokens.md`: add to
  Consequences — the refresh token's lifetime has a single source
  (`JWT_REFRESH_TOKEN_EXPIRES_IN`).
- `ai/rules/auth-and-api-contracts.md`: Password Reset section — atomic
  consumption; Auth Model section — single refresh-lifetime variable.
- `ai/skills/auth-flow.md`: reset token hashed HMAC-only, consumed
  atomically.
- `ai/skills/security-review.md`: mandatory `expiresIn` on both tokens;
  dummy hash check against timing enumeration.
- `ai/skills/mongoose-models.md`: already documents `unique: true` for
  `user.email` — check the text doesn't contradict the new 409 behavior
  (catching `E11000` in the service).
- `README.md`: no change needed to the auth-model description (already
  covers the refresh cookie and the stateless scheme); check nothing
  contradicts it.

## Verification

- `npm run lint`
- `npm run build`
- Manual pass on the dev server: register → login → new-tokens → logout;
  reusing one reset token twice; registering the same email twice.

## Deviation from plan (as actually implemented)

Commits 1+2+4 were merged into one — all three touch the same block of
`auth.service.ts` (cookie options, `generateSessionTokens`,
`getRefreshTokenExpiresAt`, `validateUser`); splitting one function across
commits would have been artificial. Commits 3+5 were merged — both live in
`user.service.ts` (reset token and the registration race). Actual
breakdown:

1. `docs(ai): add spec and plan for MY-53 auth fixes` (already committed).
2. `fix(auth): unify refresh-token expiry, require expiresIn, fix cross-site cookie policy, timing-safe login` — `auth.service.ts`, `auth.constants.ts`, `.env.sample`.
3. `fix(auth): HMAC-only atomic reset-token consumption; 409 on registration race` — `auth.utils.ts`, `auth-account.service.ts`, `user.service.ts`.
4. `docs(ai): document auth fixes in decisions/rules/skills`.

Live manual verification over HTTP (register/login with a real Turnstile
token) was not done: `CLOUDFLARE_TURNSTILE_SECRET_KEY` in `.env` is not a
Cloudflare dummy key, it's a real site's secret and needs a token from a
live widget. `MONGO_HOST` in `.env` points at a real Atlas cluster
(`swoosh-cluster-1`), so the email/reset-token races weren't load-tested
against the shared database. Checked instead: `npm run lint` / `npm run
build` are clean, and a line-by-line read of the changed branches against
the scenarios in the issue (`ai/superpowers/specs/...md`).
