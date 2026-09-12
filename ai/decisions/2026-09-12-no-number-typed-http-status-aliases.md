# No number-typed aliases over HttpStatus

Date: 2026-09-12 · Status: accepted

## Context

`common/errors/error-codes.constants.ts` had `BAD_REQUEST_STATUS` and
`INTERNAL_SERVER_ERROR_STATUS`, both `: number` aliases of
`HttpStatus.BAD_REQUEST`/`HttpStatus.INTERNAL_SERVER_ERROR`. No other file in
the project aliases a `HttpStatus` member this way — the 12 controllers using
`@HttpCode(HttpStatus.OK)`/`HttpStatus.CREATED` reference the enum directly.
`all-exceptions.filter.ts` even mixed the alias and the raw enum member in
the same file.

The `: number` typing wasn't arbitrary: comparing a plain-`number`-typed local
(`status`, `statusCode` — sourced from `HttpException.getStatus()` and
Express's `response.statusCode`, both declared `number` by their libraries)
against a `HttpStatus` enum member directly trips
`@typescript-eslint/no-unsafe-enum-comparison` (part of
`tseslint.configs.recommendedTypeChecked`, see
[decisions/strict-ts-and-working-eslint](2026-09-12-strict-ts-and-working-eslint.md)).
The aliases existed to sidestep that lint rule by keeping both sides of the
comparison plain `number`.

## Decision

- Removed both aliases (MY-78). `all-exceptions.filter.ts`,
  `request-logging.middleware.ts`, and `request-logging.utils.ts` reference
  `HttpStatus.BAD_REQUEST`/`HttpStatus.INTERNAL_SERVER_ERROR` directly.
- Fixed the resulting `no-unsafe-enum-comparison` hits by typing the status
  value as `HttpStatus` as soon as it enters this code (`resolveStatus()`'s
  return type, `buildResponseBody`'s `status` parameter,
  `RequestLogPayload.statusCode`, the `statusCode` local in
  `request-logging.middleware.ts`), not with a per-comparison
  `eslint-disable-next-line` or an `as`/`as number` cast. TypeScript's numeric
  enums accept any `number`-typed value at that boundary with no cast needed
  (a well-known looseness of numeric enums) — once the value carries the
  `HttpStatus` type, every later comparison is enum-to-enum and the rule
  doesn't fire at all.

## Consequences

- Do not add a new `: number` alias/cast for a `HttpStatus` member, and don't
  reach for `eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison`
  either — retype the value as `HttpStatus` where it's first produced
  (a function's return type, an interface field, a local's declared type)
  and let it flow through as the enum type.
- `bun run lint` and `bun run build` pass with zero `eslint-disable` comments
  in this area; the 400/500 thresholds are unchanged
  (`HttpStatus.BAD_REQUEST === 400`, `HttpStatus.INTERNAL_SERVER_ERROR === 500`).
