# Request logger: Nest's built-in Logger, not pino

Date: 2026-09-12 · Status: accepted

## Context

MY-50 needed request logging with a request id. The two realistic options were Nest's built-in `Logger` (already used by `AllExceptionsFilter`) or switching to `pino` for structured JSON-lines output. The deciding question: does the hosting setup have a log collector that needs strict machine-readable JSON today?

## Decision

Stay on Nest's built-in `Logger`. No external log collector exists yet — wiring one up is explicitly out of scope for MY-50 — so there is no concrete consumer that needs strict JSON-per-line output right now. To keep the door open without adding a dependency, both the new request-logging middleware and `AllExceptionsFilter`'s error log pass a `JSON.stringify`'d payload as the log message through the existing `Logger`. The payload is already shaped like the JSON a real structured-logging transport would emit — only the transport (console text prefix vs. strict JSON lines) would need to change later, not the payload.

## Consequences

- No new logging library or dependency.
- The console output is still Nest's default text line (timestamp + context + the JSON message) — not strict JSON-per-line. A future log collector that needs the latter would need either a small custom Nest logger implementation or an actual switch to `pino`/`nestjs-pino`.
- If a real external log collector is adopted later, that's a new decision (superseding this one), made against a concrete integration requirement instead of a hypothetical one.
