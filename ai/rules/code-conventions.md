# Code Conventions

## TypeScript

- Prefer readable, explicit TypeScript over clever abstractions. Small, boring, easy-to-explain code over clever code.
- Keep controller, service, DTO, model, Swagger, and utility responsibilities separate.
- Use path aliases already configured by the project (`@modules/*`, `@common/*`, `@shared/*`) and module barrels over deep relative paths.
- `tsconfig.json` has `strict: true` and `noUncheckedIndexedAccess: true` — both are enforced at `bun run build`, not just style advice. The one deliberate exception is `strictPropertyInitialization: false`, kept off because Mongoose schema classes declare fields (`@Prop() name: string`) with no constructor initializer by design — see [decisions/strict-ts-and-working-eslint](../decisions/2026-09-12-strict-ts-and-working-eslint.md).
- `@typescript-eslint/no-explicit-any` is `'error'` — `any` is not allowed, not just discouraged. If one is genuinely unavoidable, use a local `// eslint-disable-next-line @typescript-eslint/no-explicit-any` with a one-line reason, not a broader disable or a rule downgrade. Prefer narrowing (type guards, `unknown` + a check) over `any` or an `as` assertion.
- Prefer `readonly` for injected dependencies and values that never reassign.
- Prefer explicit names over abbreviations — e.g. `context`, not `ctx` (including Nest's `ArgumentsHost`/`ExecutionContext` locals).

## Types

- Prefer `interface` for object-shaped public contracts (DTO-adjacent shapes, response contracts).
- Prefer `type` for unions, literal variants, and utility composition.
- Do not inline an object type for a class field, cache entry, or function param/return shape — even when it's private/internal state, and even when it's a single-property options bag (`function f(options: { example: number })`). Name it and put it in `<feature>.types.ts` next to the other feature-local shapes (e.g. `FiltersMetadataCacheEntry` in `src/modules/products/products.types.ts`; `QueryLimitPropertyDocsOptions` in `src/common/swagger/types/swagger.types.ts`). An inline `{ ... }` type annotation cannot be reused, named in an error message, or found by searching for it.
- Prefer an `as const` object with a derived union type over a TS `enum` — that is the established pattern here (`ROLES` in `src/modules/users/users.types.ts`).
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
- **Role / status sets**: an UPPER_SNAKE `as const` object plus a derived union of the same name — see `ROLES` in `src/modules/users/users.types.ts`. Do not introduce a TS `enum` as a competing style.
- **Module/service/controller/file-prefix — plural; model/DTO/entity-derived type — singular.** A feature module's folder, its `*.module.ts`/`*.controller.ts`/`*.service.ts` file prefix, and the corresponding classes (`UsersModule`, `UsersController`, `UsersService`) are plural, even when a file documents or handles a single entity (`ProductsResponseDocs` describes one product; `UsersAddressResponseDocs` describes one address). The model class, its file, and anything typed directly off it — Mongoose model classes (`User`, `Product`), DTOs (`CreateProductDto`, `UpdateUserDto`), and derived types (`UserModel`, `ProductModel`) — stay singular. `products` and `users` are the reference pair for this split.

## Imports

- Import shared helpers from their barrel (`index.ts`) when one exists, not the file directly. This applies to feature modules too, not just `common`/`shared` — a module another module needs to reach into (e.g. `src/modules/auth/index.ts`) exports a barrel; import from it (`@modules/auth`), never a deep path (`@modules/auth/decorators/auth.decorator`).
- Use path aliases over relative chains that climb out of the module.
- Do not fight the linter's import order — run `npm run lint` and take its ordering.

## Documentation language

- Swagger `description`/`summary` text is written in Russian; `ApiTags` category names, code, comments, and identifiers stay in English. This rolls out module by module as each is touched, not as a one-shot rewrite — `auth` is done (MY-54); other modules keep their existing English copy until their own change touches it. Don't half-translate a module: when you touch a module's Swagger for another reason, translate the rest of that file in the same change.

## Error handling

- Throw built-in Nest HTTP exceptions from services (`BadRequestException`, `UnauthorizedException`, `NotFoundException`, …).
- The global `AllExceptionsFilter` (`src/common/errors`) maps every exception to the canonical envelope in `ai/rules/auth-and-api-contracts.md` (Error Response Contract). Do not hand-roll a different per-endpoint error shape.
- Keep reused, user-facing error messages in `<feature>.constants.ts`; inline one-offs.
- Never leak internals — stack traces, secrets, hashed values, raw Mongo errors — into a thrown message.

## Async

- Use `async/await`; no floating promises (await it, or explicitly `void` it). `@typescript-eslint/no-floating-promises` is `'error'` — this fails `bun run lint`, it isn't just a style note.
- Keep heavy synchronous work off request paths.

## Formatting

- Formatting is owned by Prettier (`.prettierrc`): no semicolons, single quotes, trailing commas everywhere, 2-space indent, 80-column width, always-parenthesized arrow params, `endOfLine: "auto"` (accepts whichever line ending a file already has — a Windows checkout with `core.autocrlf=true` shouldn't fight the linter over CRLF vs LF). Do not hand-format against it.
- `prettier/prettier` is `'error'` (the default from `eslint-plugin-prettier`'s `recommended` config, not overridden) — `bun run lint` fails on unformatted code, it does not merely warn. Run `bun run format` / `bun run lint` — do not argue style in review when the linter is green.

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
