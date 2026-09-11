# Plan: EmailService error handling and subject ownership (MY-49)

Issue: [MY-49](https://linear.app/my-workspace-5105/issue/MY-49/emailservice-ne-proglatyvat-oshibki-resend-zabrat-subject-vnutr)
Branch: `my-49-email-send-errors`
Spec: [2026-09-11-email-send-error-handling.md](../specs/2026-09-11-email-send-error-handling.md)

## Commit breakdown

1. `docs(ai): add spec+plan for MY-49` — this file and the spec, before code.
2. `feat(email): log and wrap Resend send failures, own the reset-password subject`
   - New `src/common/email/email.constants.ts`: `RESET_PASSWORD_EMAIL_SUBJECT` (moved from `auth.constants.ts`, value unchanged: `'Сброс пароля'`), `EMAIL_SEND_FAILED_ERROR` (new, generic message for the thrown exception).
   - `email.service.ts`: add a `Logger` instance. `sendResetPasswordEmail(to, url)` drops `subject`, uses `RESET_PASSWORD_EMAIL_SUBJECT` internally. `send()` wraps `this.resend.send(...)` — checks the resolved `{ error }` case and catches a rejected promise, logs `to` + `subject` + the provider's error (name/message, or the caught error's stack) in both cases, and throws `InternalServerErrorException(EMAIL_SEND_FAILED_ERROR)` — never the provider's own message or response.
3. `fix(auth): stop passing subject to sendResetPasswordEmail, keep anti-enumeration on send failure`
   - `auth-account.service.ts`: drop the `RESET_PASSWORD_SUBJECT` import/argument. Wrap the `sendResetPasswordEmail` call in `requestPasswordReset` in a `try/catch` that swallows the exception (already logged by `EmailService`) — the method still returns `true` unconditionally, so the response is identical whether the user doesn't exist, the email sent, or the email failed to send.
   - `auth.constants.ts`: remove `RESET_PASSWORD_SUBJECT` (moved to `email.constants.ts`).
4. `docs(ai): document email send-failure handling`
   - `ai/map.md`: `email` row — mention `email.constants.ts` and that send failures are logged + thrown as `InternalServerErrorException`, never leaked to the caller.
   - `ai/skills/auth-flow.md`: password-reset section — note that `requestPasswordReset` swallows email-send failures on purpose (anti-enumeration), and why.
   - `ai/rules/auth-and-api-contracts.md`: Password Reset section — add the explicit rule that an email-send failure must not change `request-password-reset`'s response, so it isn't "fixed" back into a leak later.

## Risks / invariants

- `sendResetPasswordEmail`'s signature change breaks any caller still passing `subject` — `npm run build` catches it; the only caller is `auth-account.service.ts` (checked, no others).
- The thrown exception's message must stay the fixed `EMAIL_SEND_FAILED_ERROR` — never interpolate `error.name`/`error.message` into it, only into the `Logger.error` call.
- `requestPasswordReset` must keep returning `true` on the swallowed-failure path — do not let the catch block rethrow or change the return value.

## Verification

- `npm run lint`
- `npm run build`
- Manual: point `RESEND_API_KEY` at an invalid value, call `POST /auth/request-password-reset` with a real user's email — response stays `true`, log shows the recipient and the provider's rejection, response body has no provider detail.
