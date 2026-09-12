# Spec: EmailService error handling and subject ownership (MY-49)

Issue: [MY-49](https://linear.app/my-workspace-5105/issue/MY-49/emailservice-ne-proglatyvat-oshibki-resend-zabrat-subject-vnutr)

## Root cause

`ResendService.send()` (from `nestjs-resend`, wrapping the `resend` SDK) does **not** throw on an API-level failure (invalid key, rejected domain, rate limit). It resolves to a discriminated union: `{ data, error: null }` on success, `{ data: null, error: { name, message } }` on failure. `EmailService.send` currently returns that value as-is and nobody inspects `.error` — a failed send is indistinguishable from a successful one anywhere in the codebase. A network-level failure (the promise rejecting) is a separate, second failure mode that also isn't handled today.

## Contract changes

1. **`EmailService.sendResetPasswordEmail(to: string, url: string)`** — drops the `subject` parameter. The subject is owned by the service, next to the template it belongs to (`RESET_PASSWORD_EMAIL_SUBJECT` in the new `email.constants.ts`).
2. **Send failures (both `{ error }` and a rejected promise) are logged via Nest's `Logger`** with enough context to act on (recipient, subject/email identity, the provider's `error.name`/`error.message` or caught error), then rethrown as `InternalServerErrorException(EMAIL_SEND_FAILED_ERROR)` — a fixed, generic message. No provider response, key, or internal id ever reaches the thrown exception or, therefore, the HTTP response (the global `AllExceptionsFilter` renders any 5xx as the opaque `INTERNAL_ERROR` envelope regardless of the exception's own message).
3. **`AuthAccountService.requestPasswordReset` swallows that exception.** The endpoint's response contract does not change: it still returns `true` whether the email doesn't exist, the email exists and sends fine, or the email exists but Resend failed. This is the resolution to the issue's stated conflict ("tell someone sending failed" vs "don't reveal whether the email exists") — the failure is recorded via `EmailService`'s log line, not via a different HTTP response.

## Out of scope (per issue)

- Retries, a send queue, delivery webhooks.
- New templates, i18n of subjects/copy.
- Switching providers.

## Verification

- `npm run lint` / `npm run build` (signature change breaks callers if missed).
- Manual: a deliberately broken `RESEND_API_KEY` still returns `true` from `POST /auth/request-password-reset` for an existing email, with a log line naming the recipient and the provider's rejection reason, and no provider detail in the response body.
