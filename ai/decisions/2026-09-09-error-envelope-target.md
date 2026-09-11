# Canonical error envelope as the target

Date: 2026-09-09 · Status: implemented (MY-39, 2026-09-11)

## Context

The backend returns Nest's default error format (`statusCode` / `message`). The author's other backends all expose one consistent error shape, and clients need predictable parsing — field-level validation especially.

## Decision

The target error contract is a single envelope:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "fields": { "page": "Invalid input: expected number, received string" }
  }
}
```

Errors about the whole object (not one field) go under the `_root` key inside `fields`. The contract is recorded in `ai/rules/auth-and-api-contracts.md` → Error Response Contract.

## Consequences

- **Implemented in MY-39**: a global `AllExceptionsFilter` (`src/common/errors`) maps every exception to this envelope; the `ValidationPipe`'s `exceptionFactory` produces a `ValidationFailedException` carrying the flattened `fields` map so field-level `VALIDATION_ERROR` is told apart from any other `BAD_REQUEST`. Swagger error responses now document the envelope via `ErrorResponseDocs`.
- Throw built-in Nest HTTP exceptions from services — do **not** invent a third, per-endpoint error shape.
- Rollout is a breaking change for clients parsing `message` / `statusCode` — coordinate with the frontend before it ships.
