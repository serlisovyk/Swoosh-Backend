# Plan: Remove BAD_REQUEST_STATUS/INTERNAL_SERVER_ERROR_STATUS aliases

Linear: MY-78 · No spec — pure internal refactor, no observable-behavior or
contract change (same `HttpStatus.*` values, just referenced directly).

## Commit breakdown

1. **docs(ai): plan for MY-78 status-alias removal** — this plan, committed
   alone, before any code.

2. **refactor(common): use HttpStatus directly instead of *_STATUS aliases**
   - `common/errors/error-codes.constants.ts` — remove `BAD_REQUEST_STATUS`
     and `INTERNAL_SERVER_ERROR_STATUS`.
   - `common/errors/index.ts` — drop their re-export.
   - `common/errors/all-exceptions.filter.ts` — replace
     `INTERNAL_SERVER_ERROR_STATUS` with `HttpStatus.INTERNAL_SERVER_ERROR`
     (already imports `HttpStatus`).
   - `common/logging/request-logging.middleware.ts` — replace
     `BAD_REQUEST_STATUS` (imported from `@common/errors`) with
     `HttpStatus.BAD_REQUEST` (new `HttpStatus` import from `@nestjs/common`).
   - `common/logging/request-logging.utils.ts` — replace both
     `BAD_REQUEST_STATUS` and `INTERNAL_SERVER_ERROR_STATUS` with
     `HttpStatus.BAD_REQUEST`/`HttpStatus.INTERNAL_SERVER_ERROR` (new
     `HttpStatus` import).
   - No other files reference either alias (confirmed by repo-wide grep).

## Verification

- `bun run lint`
- `bun run build`
- Manual reasoning: `HttpStatus.BAD_REQUEST` === 400 === old
  `BAD_REQUEST_STATUS`; `HttpStatus.INTERNAL_SERVER_ERROR` === 500 === old
  `INTERNAL_SERVER_ERROR_STATUS` — logging thresholds and the error filter's
  5xx branch behave identically.
