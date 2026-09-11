# Spec: canonical error envelope (MY-39)

## Target contract

Every error response, from every endpoint, becomes:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "fields": { "page": "Invalid input: expected number, received string" }
  }
}
```

`fields` is present only for field-level validation errors; whole-object errors go under `fields._root`. This matches `ai/rules/auth-and-api-contracts.md` → Error Response Contract and closes decision [`2026-09-09-error-envelope-target`](../../decisions/2026-09-09-error-envelope-target.md).

## Status → code mapping

| Status | code |
|---|---|
| 400 (class-validator payload) | `VALIDATION_ERROR` |
| 400 (anything else, incl. Turnstile) | `BAD_REQUEST` |
| 401 | `UNAUTHORIZED` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND` |
| 409 | `CONFLICT` |
| 429 | `TOO_MANY_REQUESTS` |
| ≥500 or unrecognized exception | `INTERNAL_ERROR` |
| any other unmapped 4xx | `BAD_REQUEST` (fallback) |

The two 400 shapes are told apart by exception **type**, not by inspecting the message: the global `ValidationPipe` gets a custom `exceptionFactory` that throws a dedicated `ValidationFailedException` (extends `BadRequestException`) carrying the already-flattened `fields` map. Every other `BadRequestException` (Turnstile, manual `throw new BadRequestException(...)` in services) falls through to the plain `BAD_REQUEST` branch with no `fields` key.

## Components (`src/common/errors/`)

- `error-codes.constants.ts` — `ERROR_CODES` as-const object + derived `ErrorCode` union (same pattern as `ROLES`).
- `errors.constants.ts` — `INTERNAL_ERROR_MESSAGE`, `VALIDATION_ERROR_MESSAGE` (generic, no per-module text rewrites).
- `errors.types.ts` — `ErrorResponseBody` interface.
- `validation-failed.exception.ts` — `ValidationFailedException`, `flattenValidationErrors(errors: ValidationError[])` (recurses into `.children`, joins multiple constraints per property with `; `, falls back to `_root` when a `ValidationError` has no usable property name).
- `all-exceptions.filter.ts` — `@Catch() AllExceptionsFilter implements ExceptionFilter`. Resolves status (`HttpException.getStatus()` or 500 for anything else), builds the envelope, logs 5xx with `Logger` (stack included) and never puts stack/internal detail in the response body.
- `errors.swagger.ts` — `ErrorBodyDocs` + `ErrorResponseDocs` classes for Swagger, `type: ErrorResponseDocs` on every 400/401/403/404/409/429 response decorator across all `*.swagger.ts` files.
- `index.ts` — barrel.

## Wiring

- `src/shared/config/validation.config.ts`: add `exceptionFactory` producing `ValidationFailedException`.
- `src/main.ts`: `app.useGlobalFilters(new AllExceptionsFilter())`.
- No controller/service/guard changes needed — Nest funnels guard/strategy exceptions (`JwtAuthGuard` 401, `ThrottlerGuard` 429) and service-thrown exceptions through the same global filter; verified by reading `JwtStrategy`/`ThrottlerGuard`/`RolesGuard`, none of which have a local `@Catch`.

## Out of scope / not applicable in this codebase yet

- MY-48 (system module) and MY-47 (basic-auth-gated Swagger docs) are not in `main`. `SwaggerModule.setup` mounts docs via the raw HTTP adapter, outside Nest's exception-filter pipeline, so the filter will not touch it once MY-47 lands either — noted in `ai/rules/architecture.md` for whoever picks that up.
- No i18n, no per-module message rewrites, no token revocation (per issue's own "Вне скоупа").
- MY-49 (Resend error) and MY-50 (request logging / `x-request-id`) are separate tickets; this filter's `Logger` call is a plain call, not the future request-scoped logger.

## Risk callouts

- Breaking change for any client parsing Nest's `statusCode`/`message` — flagged in the decision record already; no code mitigation needed here, it's a coordination item for the author.
- `forbidNonWhitelisted` errors carry the real property name in `ValidationError.property`, so they flatten like any other field error — verified against class-validator's shape, no special case needed.
