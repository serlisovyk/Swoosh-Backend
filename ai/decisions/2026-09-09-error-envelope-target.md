# Canonical error envelope as the target

Date: 2026-09-09 · Status: accepted (not implemented)

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

- **The runtime is not aligned yet**: there is no global `@Catch` filter, so Nest's default shape is returned. Aligning it is task **MY-39**, deliberately outside foundation work.
- Until then: throw built-in Nest HTTP exceptions and do **not** invent a third, per-endpoint error shape.
- Rollout is a breaking change for clients parsing `message` / `statusCode` — coordinate with the frontend.
- Once implemented, drop the "not yet implemented" note in the rules and update the Swagger error responses.
