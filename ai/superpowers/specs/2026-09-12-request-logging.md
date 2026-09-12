# Spec: request logging and x-request-id (MY-50)

## Target behavior

Every response, success or error, carries an `x-request-id` header. A client-supplied id (matching a safe id shape) is echoed back; otherwise one is generated. Every request is logged once, after it finishes, with method, path (no query string), status code, duration in ms, and the request id — never the request body, `Authorization` header, cookies, or any query string.

## Logger choice: Nest's built-in `Logger`, not pino

Decision recorded in `ai/decisions/2026-09-12-request-logger-choice.md`. Summary: no external log collector exists yet (out of scope per this issue), so there is no concrete requirement for strict JSON-lines output today. The request-logging middleware and `AllExceptionsFilter` pass a `JSON.stringify`'d payload as the log message through Nest's existing `Logger` — parseable today, and a low-cost swap to pino later if a real collector integration shows up (new decision at that point, not this one).

## Components (new `src/common/logging/`)

- `request-logging.constants.ts` — `REQUEST_ID_HEADER = 'x-request-id'`, `REQUEST_ID_PATTERN` (safe id shape: `/^[\w-]{1,128}$/`), `SKIP_LOGGING_PATHS` (the two `system` module paths, `/${API_PREFIX}` and `/${API_PREFIX}/health`, built from `@shared/constants`'s `API_PREFIX` — both are static, unauthenticated, `@SkipThrottle()` infra-ping endpoints that cannot themselves error, so skipping their successful-request log line removes the named noise risk entirely instead of relying on level-filtering alone), `PRODUCTION_LOG_LEVELS` (`LogLevel[]`, applied outside dev — see Wiring).
- `request-logging.types.ts` — `RequestLogPayload` (`requestId`, `method`, `path`, `statusCode`, `durationMs`) per `ai/rules/code-conventions.md`'s "name inline shapes" rule. The `Express.Request.requestId` type augmentation lives separately in `src/global.d.ts` (project-root ambient file, not part of this feature package — a `declare namespace` needs no `@typescript-eslint/no-namespace` suppression there, since the file has no imports/exports and is treated as a global ambient script, unlike a `declare global` block inside an otherwise-normal module file).
- `request-logging.utils.ts` — `resolveRequestId(request)` (the id-resolution logic described below) and `logRequest(payload)` (the status-to-level mapping), split out from the middleware so each piece can be read/changed independently.
- `request-logging.middleware.ts` — `requestLoggingMiddleware(request, response, next)`:
  - Resolves the id via `resolveRequestId`: incoming `x-request-id` header if present, non-array, and matches `REQUEST_ID_PATTERN`; otherwise `randomUUID()`. Validating the incoming value (rather than trusting it verbatim) avoids `response.setHeader` throwing on a header-injection attempt (`\r\n` etc.) — Node's `http` layer rejects invalid header values at the point they're set, which would otherwise surface as an unhandled synchronous throw in this same middleware, before Nest's own exception filter is in the picture.
  - Sets `request.requestId` and `response.setHeader(REQUEST_ID_HEADER, requestId)` before calling `next()`, so the header is present on every response this app produces, including ones that error later in the pipeline.
  - Registers a `response.on('finish', ...)` listener that computes duration, builds the `RequestLogPayload`, skips emission when `request.path` is one of `SKIP_LOGGING_PATHS` and the response was successful (below `BAD_REQUEST_STATUS`), and otherwise calls `logRequest`, which logs via a module-level `Logger`: `error` at/above `INTERNAL_SERVER_ERROR_STATUS`, `warn` at/above `BAD_REQUEST_STATUS` (both imported from `@common/errors`, not re-declared, so the 400/500 thresholds have one source), `debug` otherwise.
- `index.ts` — barrel: `requestLoggingMiddleware`, `PRODUCTION_LOG_LEVELS`, `REQUEST_ID_HEADER`.

## Wiring

- `src/main.ts`: `app.use(requestLoggingMiddleware)` as the very first line after `NestFactory.create`, before `cookie-parser`/`helmet`/`enableCors` — so the id and timer cover the whole request, including those other middlewares.
- `src/main.ts`: once `configService` is available, `Logger.overrideLogger(PRODUCTION_LOG_LEVELS)` runs when `!isDev(configService)` — reusing the existing `isDev` helper rather than reading `process.env` directly, at the cost of Nest's own boot-time logs staying at full verbosity for the brief window before this call (acceptable — no request has been served yet). This is what actually keeps successful-request logging quiet in production (the per-request `debug` call becomes a no-op there), not just the path-skip above.
- `src/common/errors/all-exceptions.filter.ts`: the existing 5xx `logger.error(...)` call appends `request.requestId` to the log line, so a production error can be matched back to its request-logging line and to whatever the client reports.

## Out of scope

- External log collectors, APM, cross-service tracing, metrics/alerts, user-action audit log — all explicitly out of scope per the issue.
- Adding `x-request-id` to Swagger response docs: no per-endpoint Swagger change requested by the issue, and `@ApiHeader` documents *request* headers, not response ones — documenting a global response header per endpoint would be a much larger, unrequested change. The header's existence is documented in `ai/rules/auth-and-api-contracts.md` prose instead.
- Any change to the error envelope response *body* shape — `x-request-id` travels as a header, already present on error responses via the same global middleware; the JSON body contract from MY-39 is untouched.

## Manual verification plan

- Request without `x-request-id` → response carries a generated one (UUID shape).
- Request with `x-request-id: my-id` → response echoes `my-id` back; log line shows `my-id`.
- Request with an invalid id (e.g. containing a space or control character) → response carries a freshly generated id instead, not the invalid input.
- Trigger a 500 → filter's log line and the request-logging line for the same request show the same id.
- Hit `/api/v1/health` repeatedly → no per-request log line on success.
- Confirm no log line anywhere contains `authorization`, a cookie value, or a request body.
