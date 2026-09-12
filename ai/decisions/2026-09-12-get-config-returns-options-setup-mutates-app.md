# `get*Config` returns options, `setup*(app)` mutates the app

Date: 2026-09-12 · Status: accepted

## Context

The repo has a family of `get<X>Config` functions that all return options for
something else to apply: `getMongoConfig`, `getThrottlerConfig`,
`getTurnstileConfig`, `getResendConfig`. `setupValidation(app)` was the one
outlier — instead of returning `ValidationPipeOptions`, it took the Nest
`app` and called `app.useGlobalPipes(...)` itself. That made the validation
options unreadable and unreusable without the side effect, which matters
because they are about to become environment-dependent
(`disableErrorMessages` in prod, `enableDebugMessages` in dev) and `main.ts`
already holds the `ConfigService` needed for that.

Registering validation as a provider instead (`APP_PIPE` in a module, the way
`ThrottlerModule` registers `APP_GUARD`) was considered and rejected: the
`ValidationPipe` needs no dependency injection, and `useGlobalPipes` plus a
plain function is closer to the rest of `main.ts`'s bootstrap style than
adding a module just to host one provider.

## Decision

- A function named `get<X>Config` **returns options** — it is pure, takes no
  `app`, and has no side effect (it may still take plain parameters, the way
  `getMongoConfig(config)` does). `setupValidation` was renamed to
  `getValidationConfig(exceptionFactory)`, returning
  `{ whitelist, transform, forbidNonWhitelisted, exceptionFactory }`; `main.ts`
  passes its `exceptionFactory` in and hands the whole result straight to
  `new ValidationPipe(...)` — no app-shaped merge at the call site.
- A function named `setup*(app)` **mutates the application** — it is the only
  category allowed to take `NestExpressApplication` and call methods on it.
  `setupSwagger` keeps this name: it genuinely has nothing meaningful to
  return, only side effects to perform.
- Validation registration stays a plain `useGlobalPipes` call in `main.ts`,
  not an `APP_PIPE` provider — no DI need justifies the extra module.

## Consequences

- Any future `shared/config/*.config.ts` file must pick one of the two
  shapes on creation, not invent a third.
- `getValidationConfig` can be read, tested, or reused without triggering
  Nest bootstrap — e.g. once it takes a `ConfigService` for env-dependent
  options, that logic is unit-reasonable without spinning up an app.
- `ai/rules/architecture.md` states the naming convention explicitly, so it
  is not re-litigated per file.
