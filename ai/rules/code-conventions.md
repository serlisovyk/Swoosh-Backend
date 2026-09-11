# Code Conventions

## TypeScript

- Prefer readable, explicit TypeScript over clever abstractions. Small, boring, easy-to-explain code over clever code.
- Keep controller, service, DTO, model, Swagger, and utility responsibilities separate.
- Use path aliases already configured by the project (`@modules/*`, `@common/*`, `@shared/*`) and module barrels over deep relative paths.
- Avoid broad `any`; when unavoidable, keep it local and obvious. Prefer narrowing over `as` type assertions.
- Prefer `readonly` for injected dependencies and values that never reassign.
- Prefer explicit names over abbreviations — e.g. `context`, not `ctx` (including Nest's `ArgumentsHost`/`ExecutionContext` locals).

## Types

- Prefer `interface` for object-shaped public contracts (DTO-adjacent shapes, response contracts).
- Prefer `type` for unions, literal variants, and utility composition.
- Prefer an `as const` object with a derived union type over a TS `enum` — that is the established pattern here (`ROLES` in `src/modules/user/user.types.ts`).
- Keep exported types and function names easy to explain out loud.
- Don't nest an object literal type inside another interface's property (`{ error: { code: ...; message: ...; fields?: ... } }`). Extract the inner shape into its own named interface and reference it (`interface ErrorBody { code; message; fields? }`, then `interface ErrorResponseBody { error: ErrorBody }`) — see `src/common/errors/errors.types.ts`.

## Comments

- Comment only to explain **why** a non-obvious decision exists, not what the code does.
- Keep comments rare and useful; delete stale ones with the code they described.

## Naming

- **Files**: kebab-case with a role suffix — `*.controller.ts`, `*.service.ts`, `*.module.ts`, `*.model.ts`, `*.dto.ts`, `*.swagger.ts`, `*.utils.ts`, `*.types.ts`, `*.constants.ts`, `*.config.ts`, `*.guard.ts`, `*.strategy.ts`, `*.decorator.ts`.
- **List query DTO** files: `find-all-<feature>.dto.ts`; mutations: `create-*` / `update-*`.
- **Classes**: PascalCase. DTOs end in `Dto` (`CreateProductDto`); guards end in `Guard` (`JwtAuthGuard`); Mongoose schema classes match the collection name.
- **Composite/param decorators**: PascalCase factory functions (`Auth`, `Captcha`).
- **Exported constants**: UPPER_SNAKE_CASE for domain/config values (`DEFAULT_PRODUCTS_LIMIT`, `PRODUCT_SORT_MAP`, cookie names, throttle configs).
- **Role / status sets**: an UPPER_SNAKE `as const` object plus a derived union of the same name — see `ROLES` in `src/modules/user/user.types.ts`. Do not introduce a TS `enum` as a competing style.

## Imports

- Import shared helpers from their barrel (`index.ts`) when one exists, not the file directly.
- Use path aliases over relative chains that climb out of the module.
- Do not fight the linter's import order — run `npm run lint` and take its ordering.

## Error handling

- Throw built-in Nest HTTP exceptions from services (`BadRequestException`, `UnauthorizedException`, `NotFoundException`, …).
- The global `AllExceptionsFilter` (`src/common/errors`) maps every exception to the canonical envelope in `ai/rules/auth-and-api-contracts.md` (Error Response Contract). Do not hand-roll a different per-endpoint error shape.
- Keep reused, user-facing error messages in `<feature>.constants.ts`; inline one-offs.
- Never leak internals — stack traces, secrets, hashed values, raw Mongo errors — into a thrown message.

## Async

- Use `async/await`; no floating promises (await it, or explicitly `void` it).
- Keep heavy synchronous work off request paths.

## Formatting

- Formatting is owned by Prettier (`.prettierrc`): no semicolons, single quotes, trailing commas everywhere, 2-space indent, 80-column width, always-parenthesized arrow params. Do not hand-format against it.
- Run `npm run format` / `npm run lint` — do not argue style in review when the linter is green.

## Constants

- Do not extract every text string into constants by default.
- Keep constants for repeated values, domain values, configuration names, cookie names, throttling configs, shared examples, and values used across files.
- Inline one-off validation messages, Swagger descriptions, and examples when they are only used locally and extraction hurts readability.
- Remove stale constants after deleting features.
- Even module-private constants (a status→code lookup map, a threshold used only inside one filter/service) belong in `<feature>.constants.ts`, not declared at the top of the class file that uses them. Keeps the class file to behavior, keeps constants greppable in one place — see `src/common/errors/error-codes.constants.ts` (`STATUS_TO_ERROR_CODE`, `INTERNAL_SERVER_ERROR_STATUS`) vs `all-exceptions.filter.ts`.

## Files

- Keep feature-local helpers inside the feature module until reuse is real.
- Do not create placeholder files just to mirror another module.
- Keep generated output such as `dist` and `node_modules` out of edits.
