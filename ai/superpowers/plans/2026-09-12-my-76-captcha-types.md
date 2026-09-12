# Plan: MY-76 — extract CaptchaExceptionReason, fix ternary in getCaptchaTokenFromRequest

## Scope

`src/common/captcha/captcha.utils.ts` only. No behavior change — pure
readability/structure cleanup, no spec needed.

## Changes

1. Create `src/common/captcha/captcha.types.ts` exporting
   `type CaptchaExceptionReason = 'missing' | 'invalid'`.
2. `captcha.utils.ts`: import `CaptchaExceptionReason` from `./captcha.types`
   instead of declaring it locally.
3. `getCaptchaTokenFromRequest`: replace the nested ternary
   (`Array.isArray(token) ? (token[0] ?? '') : token || ''`) with explicit
   branches:
   ```ts
   if (Array.isArray(token)) return token[0] ?? ''

   return token || ''
   ```
   Same runtime behavior, just legible control flow.

No other file references `CaptchaExceptionReason` or
`getCaptchaTokenFromRequest`'s internals, so no barrel/import updates
elsewhere are needed.

## Commit breakdown

1. This plan (single commit, before any code).
2. The refactor itself (types extraction + ternary fix), one commit.

## Verification

- `bun run lint`
- `bun run build`
