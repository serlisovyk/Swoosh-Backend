# Spec: close the request-password-reset timing side channel (MY-80)

Issue: [MY-80](https://linear.app/my-workspace-5105/issue/MY-80/security-timing-kanal-v-request-password-reset-vydayot-sushestvovanie)

## Root cause

`PasswordResetService.requestPasswordReset` returns the same status code and
body (`true`) for an existing and a non-existing email, but not in the same
time. The found branch `await`s, in order: `usersService.setPasswordResetToken`
(HMAC hash + `findByIdAndUpdate`) and `emailService.sendResetPasswordEmail`
(a network round trip to Resend). The not-found branch returns right after
one `getByEmail` lookup. The gap is trivially measurable and, unlike the
`validateUser` login case, cannot be closed with a same-cost dummy operation
on the not-found branch — the dominant cost is a third-party network call
with highly variable latency, not a fixed-cost hash.

## Contract changes

None. `POST /auth/request-password-reset` keeps its status code, body, and
Swagger docs exactly as-is. This is an internal-timing fix only.

## Fix

`requestPasswordReset`'s found branch stops awaiting the token write and the
email send. Both are started (`void`-ed, per `ai/rules/code-conventions.md`'s
no-floating-promises rule) and left to run in the background; the method
returns `true` immediately after generating the token, the same as the
not-found branch already does. Response timing no longer depends on either
operation, so it cannot depend on whether the account exists — this is a
structural fix, not a timing approximation.

- The DB write's rejection is caught and logged (`Logger.error`, no user-facing
  effect) — previously an unawaited failure here would have surfaced as an
  unawaited-promise rejection; now it is not silent.
- The email send's rejection is caught and ignored at this call site, same
  intent as the removed `try/catch` — `EmailService.send` already logs
  send failures (recipient, subject, provider detail) before rethrowing, see
  [specs/email-send-error-handling](2026-09-11-email-send-error-handling.md).
  Nothing here changes the resolution to "swallow, don't leak" from that spec.
- The two background operations are independent, not chained — the email
  body only needs the token string, computed synchronously before either
  starts, so there's no correctness reason to serialize them behind one
  `.then()`.

See [decisions/password-reset-timing-fire-and-forget](../decisions/2026-09-12-password-reset-timing-fire-and-forget.md)
for why this was chosen over a dummy-cost operation on the not-found branch.

## Out of scope (per issue)

- `consumePasswordResetToken`'s atomic `findOneAndUpdate`, `hashTokenWithSecret`,
  and the endpoint's Swagger contract — untouched.
- Any change to `resetPassword` (the confirm step) — untouched.

## Verification

- `npm run lint` / `npm run build`.
- Manual: time `POST /auth/request-password-reset` for a known and an unknown
  email a few times each — response latency should be close for both (a rough
  comparison, not a benchmark), and both still return the same `200 { true }`.
