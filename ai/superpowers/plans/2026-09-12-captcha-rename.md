# Plan: rename turnstile.* to captcha.* inside common/captcha

Issue: MY-43

## Why

`captcha` is the domain name; `turnstile` is only the current provider. Provider-named files/symbols inside the module mean a provider swap would force renaming half the module, and a reader has to already know "captcha = turnstile" to find the right file. No behavior change — pure rename.

## Scope

Rename, in `src/common/captcha/`:

- Files: `turnstile.config.ts` → `captcha.config.ts`, `turnstile.utils.ts` → `captcha.utils.ts`. (`turnstile.types.ts` named in the issue does not exist in the current tree — `TurnstileExceptionReason` lives inline in `turnstile.utils.ts`; it becomes `CaptchaExceptionReason` in the renamed `captcha.utils.ts`, no separate types file needed.)
- Symbols: `getTurnstileConfig` → `getCaptchaConfig`, `createTurnstileException` → `createCaptchaException`, `TurnstileExceptionReason` → `CaptchaExceptionReason`, `TURNSTILE_TOKEN_HEADER` → `CAPTCHA_TOKEN_HEADER`.
- Update the barrel `src/common/captcha/index.ts` and the one external import site, `src/modules/auth/auth.swagger.ts`.

Left unchanged (literal library API, not domain naming):

- `TurnstileModule.forRootAsync` and the `nest-cloudflare-turnstile` import in `captcha.module.ts`.
- `ITurnstileOptions`, `TurnstileCaptcha` (the `@Captcha()`-aliased decorator import in `auth.controller.ts`/`password-reset.controller.ts`) — library types/exports.
- The header **value** `'cf-turnstile-token'` — real Cloudflare header name and a public contract with the frontend. Only the constant's *name* changes.

## Out of scope

- Swapping or abstracting the captcha provider.
- Any change to token-validation logic or the header's wire value.

## Commit breakdown

1. **docs(ai): plan for captcha rename (MY-43)** — this plan, alone, before any code.
2. **refactor(captcha): rename turnstile.\* files and symbols to captcha.\*** — the file renames, symbol renames, barrel export, and the `auth.swagger.ts` import update, as one commit (it's a single mechanical rename, not separable milestones).
3. **docs: update ai/map.md captcha entry with file names** — reflect the new file names in the `captcha` row (matching how `mongo`/`jwt` rows list their config files).

## Verification

- `grep -rn "[Tt]urnstile"` under `src/` turns up only the library's own exports/imports (`TurnstileModule`, `ITurnstileOptions`, `TurnstileCaptcha`) and literal Cloudflare wording in Swagger prose — no renamed symbol or file name left.
- `bun run lint` / `bun run build` clean.
- No behavior change: header value, decorator behavior, exception messages all identical before/after.
