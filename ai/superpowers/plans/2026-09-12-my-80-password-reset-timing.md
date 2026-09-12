# Plan: MY-80 — request-password-reset timing side channel

Spec: [specs/my-80-password-reset-timing](../specs/2026-09-12-my-80-password-reset-timing.md)

## Verified before touching anything

- `password-reset.service.ts:17-37` — found branch awaits
  `usersService.setPasswordResetToken` then `emailService.sendResetPasswordEmail`
  before returning `true`; not-found branch returns `true` right after
  `getByEmail`. Confirmed via read.
- `users.service.ts:164-172` (`setPasswordResetToken`) — one `hashTokenWithSecret`
  call + `findByIdAndUpdate`, no side effects beyond the write.
- `email.service.ts:26-63` — `sendResetPasswordEmail` already logs any send
  failure (recipient, subject, provider detail) via `Logger` before rethrowing
  `InternalServerErrorException(EMAIL_SEND_FAILED_ERROR)`; nothing to duplicate
  by adding another log line for this specific failure at the call site.
- `auth.service.ts:99-112` (`validateUser`) — the precedent this issue points
  to (dummy `argon2.verify` on the not-found path) only works because argon2
  hashing is fixed-cost; not applicable here since the dominant cost
  (Resend network call) is variable, hence the fire-and-forget design instead
  (see spec).

## Changes

1. **`src/modules/auth/password-reset/password-reset.service.ts`**
   - Add a private `Logger` instance (`new Logger(PasswordResetService.name)`).
   - In `requestPasswordReset`'s found branch: stop awaiting
     `setPasswordResetToken` and `sendResetPasswordEmail`. Compute `resetToken`
     and `resetUrl` synchronously as today, then fire both calls with `void`
     and a `.catch()` each:
     - `setPasswordResetToken(...).catch(...)` logs the error via the new
       `Logger` (this failure was previously visible via the awaited call;
       now it must be logged explicitly since nothing awaits it).
     - `sendResetPasswordEmail(...).catch(() => {})` keeps the existing
       swallow — the failure is already logged inside `EmailService`.
   - Return `true` immediately after firing both, unconditionally.
2. **`ai/decisions/2026-09-12-password-reset-timing-fire-and-forget.md`** (new)
   — record the fire-and-forget-over-dummy-op choice and why.
3. **`ai/skills/auth-flow.md`** — update the "Password reset" bullet that
   describes `requestPasswordReset` swallowing the email exception; it no
   longer awaits either operation, so describe the fire-and-forget shape and
   point at the MY-80 decision instead of the old awaited-try/catch framing.
4. **`ai/skills/security-review.md`** — extend the timing-safety bullet: it
   currently implies a uniform dummy-op mechanism; add that
   `request-password-reset` uses a different mechanism (fire-and-forget, not
   a dummy op) and why, so a future reviewer doesn't flag the missing dummy
   operation on the not-found branch as a regression.

Not touched: `resetPassword`/`consumePasswordResetToken`, DTOs, Swagger,
`password-reset.constants.ts`.

## Commit breakdown

1. `docs(ai): plan + spec for MY-80 password-reset timing fix` — this file +
   the spec, before any code.
2. `fix(auth): stop awaiting password-reset token write and email send` —
   the service change + the new decision record + the two skill updates.

## Verification

- `bun run lint`
- `bun run build`
- Manual: run the dev server, time `POST /auth/request-password-reset` for a
  seeded email and a random one a few times each; latencies should be close
  and both still return `200 { true }`.
