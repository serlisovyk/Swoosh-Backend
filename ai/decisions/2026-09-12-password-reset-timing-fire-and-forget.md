# Password-reset timing side channel closed with fire-and-forget, not a dummy op

Date: 2026-09-12 · Status: implemented (MY-80)

## Context

`PasswordResetService.requestPasswordReset` returned the same status/body for
an existing and a non-existing email, but the found branch awaited a DB write
and a Resend network call while the not-found branch returned almost
instantly — a measurable timing side channel revealing account existence.
`AuthService.validateUser` already solves the same class of problem for login
by running a dummy `argon2.verify` on its not-found path, since argon2 hashing
is fixed-cost. The issue asked to pick between that same dummy-cost approach
and not awaiting the found branch's work at all.

## Decision

Stop awaiting the token write and the email send; fire both in the
background (`void`-ed, each with its own `.catch()`) and return `true`
immediately, same as the not-found branch already does. Rejected the
dummy-op approach: the dominant cost on the found branch is a third-party
network call (Resend) with latency that varies request to request, so a
fixed-cost dummy operation on the not-found branch could not reliably track
it — the side channel would shrink, not close. Not awaiting either operation
removes the dependency on account existence structurally instead of
approximating it.

## Consequences

- `requestPasswordReset`'s response no longer waits on the token write or the
  email; both happen after the HTTP response is already on its way. A client
  cannot use response timing (or a failure of either background operation) to
  infer whether the account exists.
- The token write's rejection is now caught and logged explicitly at the call
  site (previously an awaited failure would have propagated as a 500,
  itself a second enumeration signal); the email send's rejection is caught
  and ignored, matching `EmailService`'s own logging (see
  [specs/email-send-error-handling](../superpowers/specs/2026-09-11-email-send-error-handling.md)).
- This mechanism is deliberately different from `validateUser`'s dummy-op
  pattern. Do not "fix" this by adding a dummy write/send on the not-found
  branch to look consistent with login — that would reintroduce the same
  network-latency mismatch problem this record exists to avoid.
