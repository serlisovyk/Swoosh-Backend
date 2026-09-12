# Repo map

Orientation in one read — so `src/` does not have to be rediscovered every session.

**Reference module:** `src/modules/products` — the fullest example of house style (query DTO, options builder, constants, types, swagger). Copy its shape.

**Path aliases:** `@modules/*` → `src/modules/*`, `@common/*` → `src/common/*`, `@shared/*` → `src/shared/*`.

## Root files

| File | What it does |
|---|---|
| `Dockerfile` | multi-stage build — `builder` (`oven/bun:1-alpine`) installs, builds, and prunes to prod-only `node_modules`; `runner` (plain `node:24-alpine`, matching `.nvmrc`) runs `dist/main.js` as the non-root `node` user |
| `docker-compose.yml` | `app` service (build + `env_file: .env` + port `3001`) is the default; an optional `mongo` service sits behind the `local-db` Compose profile for local dev without Atlas |
| `.dockerignore` | keeps `node_modules`, `dist`, `*.tsbuildinfo`, `.env`, `.git`, `ai/`, `*.md` out of the build context/image |
| `.husky/pre-commit` | `husky` git hook, provisioned by the `prepare` script on install; runs `lint-staged` |
| `.lintstagedrc.json` | `lint-staged` config: `eslint --fix` on staged `*.ts` files |

## App level

| File | What it does |
|---|---|
| `src/main.ts` | global prefix `api/v1`, `setupValidation` (global ValidationPipe), `setupSwagger`, `cookie-parser`, `helmet`, `enableCors` (origins from `CORS_DOMAINS`, credentials enabled), `x-powered-by` disabled, `PORT` via `getOrThrow` |
| `src/app.module.ts` | `ConfigModule` (global), `MongoModule`, `ThrottlerModule`, `CaptchaModule` + the feature modules |

## Feature modules (`src/modules`)

| Module | What it does | Entry files |
|---|---|---|
| `auth` | register / login / new-tokens / logout, guards, JWT strategy, decorators. No schema of its own — reuses `User`. Exports a barrel (`index.ts`: `Auth`, `Roles`, `CurrentUser`, `JwtAuthGuard`, `RolesGuard`, `UserWithoutPassword`) — other modules import from `@modules/auth`, never the file paths below. Swagger text for this module is in Russian (see `ai/rules/code-conventions.md` → Documentation language). Cookie handling is a controller concern (`auth.cookies.ts`), not the service's | `auth.controller.ts`, `auth.service.ts`, `auth.cookies.ts`, `auth.swagger.ts`, `guards/jwt.guard.ts`, `guards/roles.guard.ts`, `strategies/jwt.strategy.ts`, `decorators/{auth,roles,user}.decorator.ts`, `auth.constants.ts` |
| `auth/password-reset` | password reset: request and confirm — same `/auth` route prefix and Swagger tag as `auth` (deliberate, see [decisions/password-reset-shares-auth-prefix](../decisions/2026-09-11-password-reset-shares-auth-prefix.md)) | `password-reset.controller.ts`, `password-reset.service.ts`, `password-reset.swagger.ts`, `password-reset.constants.ts`, `dto/` |
| `users` | profile, address; **the source of `ROLES`**; model/DTO/entity types stay singular (`User`, `UserModel`, `UpdateUserDto`) next to the plural `UsersService`/`UsersController` — same split as `products` | `users.controller.ts`, `users.service.ts`, `models/user.model.ts`, `models/user-address.model.ts`, `users.types.ts` |
| `products` | catalog + list endpoint with filtering, sorting, pagination (**reference implementation**). Exports a barrel (`index.ts`: `ProductsService`, `ProductsModule`, `PRODUCT_NOT_FOUND_ERROR`, `ProductsListItemsPropertyDocs`, `ProductsResponseDocs`) — other modules import from `@modules/products`, never the file paths below (a model **class** import for typing/`ref:`, e.g. `Product` in `user.model.ts`, stays a direct path per `ai/skills/mongoose-models.md`) | `products.utils.ts` (`buildProductListQueryOptions`, regex helpers), `products.constants.ts` (`PRODUCT_SORT_MAP`, `DEFAULT_PRODUCTS_LIMIT`), `dto/find-all-products.dto.ts`, `models/{product,product-color}.model.ts` |
| `products/category` | admin-only category CRUD (`products/categories`: list all/create/rename/delete) — same no-separate-`@Module` shape as `auth/password-reset`, registered in `ProductsModule.controllers`/`providers`; delete refuses with 409 via `ProductsService.existsWithCategory` when a product still references the category. Both files and exported symbols are `product-category`/`ProductCategory`-prefixed (not just `category.*`) — deliberate, so a future unrelated "category" concept elsewhere in the codebase never collides in a search or an import list | `product-category.controller.ts`, `product-category.service.ts`, `product-category.swagger.ts`, `product-category.constants.ts`, `models/product-category.model.ts`, `dto/` |
| `favorites` | favorites list; no schema of its own — depends on `UsersModule`/`ProductsModule` and calls `UsersService`/`ProductsService`, never injects their models directly. Exports a barrel (`index.ts`: `FavoritesService`, `FavoritesModule`, the favorites-limit constants and Swagger property docs `auth`'s DTOs/`users.swagger.ts` need) — other modules import from `@modules/favorites`, never the file paths below | `favorites.service.ts`, `favorites.utils.ts` (pagination/meta), `dto/find-all-favorites.dto.ts` |
| `forms` | aggregator over three sub-modules: `contact-request`, `individual-order`, `newsletter-subscription` — each its own folder with the full anatomy (controller/service/module/dto/models/utils/types/constants/swagger); all three share regex/sort/pagination/update-options helpers and a base list-query DTO from `shared/` — only real per-module differences (search fields, `status` filter on `individual-order`) stay local | `forms.module.ts` + one folder per form |
| `system` | public root (`GET /api/v1`) and liveness health check (`GET /api/v1/health`); no schema, no auth, `@SkipThrottle()` on both | `system.controller.ts`, `system.service.ts`, `system.types.ts`, `system.swagger.ts` |

## Cross-cutting (`src/common`)

| Package | What it provides |
|---|---|
| `captcha` | Cloudflare Turnstile wrapper; the `@Captcha()` decorator — applied on auth and password-reset endpoints |
| `throttler` | global `ThrottlerGuard` registered as `APP_GUARD`; TTL/limit from env, `skipIf` in dev; tightened per route with `@Throttle` |
| `email` | Resend + `@react-email/render`; templates in `templates/*.template.tsx` (currently `reset-password`), subjects in `email.constants.ts`; a send failure (provider error or rejected promise) is logged with recipient/subject/provider detail and rethrown as `InternalServerErrorException(EMAIL_SEND_FAILED_ERROR)` — callers never see the provider's own error |
| `jwt` | wraps `@nestjs/jwt`: `JwtModule.registerAsync` + `jwt.config.ts` (reads `JWT_SECRET`). Same wrapper-over-a-library pattern as `mongo`/`captcha`/`email`/`throttler`. `auth` imports it for `JwtService`; `JwtStrategy` (domain logic — depends on `UsersService`) stays in `auth`, not here |
| `errors` | canonical error envelope: `AllExceptionsFilter` (global, wired in `main.ts`), `ValidationFailedException` + `flattenValidationErrors` (used by the global `ValidationPipe`'s `exceptionFactory`), `ERROR_CODES`, `ErrorResponseDocs` for Swagger |
| `mongo` | the single connection: `MongooseModule.forRootAsync` (`mongo.config.ts`) |
| `swagger` | `config/swagger.config.ts` (`buildSwaggerDocument` — DocumentBuilder, bearer + cookie auth, operationId — plus `setupSwagger`, which adds the `SWAGGER_ENABLED`/basic-auth gate outside dev and mounts the built document), `utils/swagger.utils.ts` (`createPropertyDocsDecorator`, `createOptionalPropertyDocsDecorator`, `addSwaggerCookieAuth`, `QueryPagePropertyDocs`/`QueryLimitPropertyDocs` — shared page/limit query-param docs, parametrized per module), `utils/swagger-basic-auth.utils.ts` (`createSwaggerBasicAuthMiddleware`), `common-responses.swagger.ts` (`ApiAuthRequiredDocs`, `ApiValidationErrorDocs`, `ApiInvalidQueryDocs`, `ApiNotFoundDocs` — shared helpers for repeated `Api*Response` text). The docs mount path (`SWAGGER_DOCS_PATH`) and the `api/v1` prefix `main.ts` sets globally both come from `shared/constants/api.constants.ts`, not a local literal |

## Shared (`src/shared`)

| File | What it provides |
|---|---|
| `config/validation.config.ts` | `setupValidation` — the global ValidationPipe: `whitelist`, `transform`, `forbidNonWhitelisted` |
| `config/env.config.ts` | `AppEnv` (`class-validator`/`class-transformer` class, every `.env.sample` key) + `validateEnv` — `ConfigModule.forRoot`'s `validate`; `AppEnv` is also the type behind every `ConfigService<AppEnv, true>` injection. Source of truth for env shape, alongside `.env.sample` — see [decisions/env-validated-at-boot](decisions/2026-09-12-env-validated-at-boot.md) |
| `utils/query.utils.ts` | query-param coercion: `toStringArrayQueryParam`, `toNumberArrayQueryParam`, `toBooleanQueryParam`, `trimStringValue`, `normalizeEmailValue` |
| `utils/{phone,env,app}.utils.ts` | `normalizePhoneValue`; `isDev` / `isProd` / `parseCorsDomainsConfigValue`; `noop` |
| `utils/pagination.utils.ts` | `resolvePaginationOffset(page, limit)` + `DEFAULT_PAGE` — the shared offset formula used by `products` (Mongo `skip`/`limit`) and `favorites` (in-memory slice); each module keeps its own default `limit` and pagination mechanism |
| `utils/list-query.utils.ts` | `resolveListQueryOptions({ page, limit, sort, sortMap, defaultSort, defaultLimit })` — resolves `skip`/`limit`/`sort` on top of `resolvePaginationOffset`; used by `contact-request`, `individual-order`, `newsletter-subscription` (`products`/`favorites` keep their own, different sort sets) |
| `utils/regex.utils.ts` | `REGEX_SPECIAL_CHARACTERS`, `escapeRegExp`, `createContainsRegex`, `createExactRegex` — used by `products` and the three form modules |
| `utils/crypto.utils.ts` | `generateToken`, `hashTokenWithSecret` — pure crypto helpers with no domain meaning, used by `auth`'s password-reset flow and `users.service.ts` |
| `types/list-query.types.ts` | `CREATED_AT_SORT_OPTIONS` (`as const` + derived union) — the shared `NEWEST`/`OLDEST` sort enum for `contact-request`/`individual-order`/`newsletter-subscription` |
| `constants/api.constants.ts` | `API_PREFIX` (`'api/v1'`) and `SWAGGER_DOCS_PATH` (derived from it) — the single source `main.ts`'s `setGlobalPrefix` and `common/swagger` both read, so the two can't drift apart |
| `constants/cookie.constants.ts` | `REFRESH_TOKEN_COOKIE_NAME` — the single source for the refresh-token cookie's name, re-exported by `auth.constants.ts` and used to derive `SWAGGER_REFRESH_TOKEN_AUTH_NAME` in `common/swagger` |
| `constants/env.constants.ts` | only the `NODE_ENV` as-const values — **not** a registry of env variable names |
| `constants/list-query.constants.ts` | `CREATED_AT_SORT_MAP`, the shared page/limit/search validation error texts, `LIST_QUERY_MAX_LIMIT` |
| `constants/mongoose.constants.ts` | `MONGOOSE_UPDATE_AFTER_OPTIONS` — the `findByIdAndUpdate` options shared by `products` and the three form modules |
| `constants/time.constants.ts` | `THIRTY_MINUTES_IN_MS`, `ONE_HOUR_IN_MS`, `ONE_DAY_IN_MS` |
| `dto/list-query.dto.ts` | `ListQueryDto` — base class for `search`/`page`/`limit` (validators, Swagger via `shared/swagger`); `find-all-<x>.dto.ts` in the three form modules extend it and add their own `sort` and any module-specific fields |
| `swagger/list-query.swagger.ts` | `ListQueryPagePropertyDocs` — the `page` Swagger doc shared by `ListQueryDto` (text is identical across the three form modules) |

## What this project does NOT have (do not invent it)

- No global interceptors — see [decisions/error-envelope-target](decisions/2026-09-09-error-envelope-target.md) (the global exception filter is implemented; interceptors are not).
- No dedicated logger — `AllExceptionsFilter` uses Nest's built-in `Logger` for 5xx errors, not a request-scoped one.
- No automated tests — see [decisions/no-test-suite](decisions/2026-09-09-no-test-suite.md).
- No `toJSON`/`transform` hooks on models — secrets are hidden with `select: false`, see [skills/mongoose-models](skills/mongoose-models.md).
- No shared pagination-**meta** helper: `products` and `favorites` each build their own list response (`{ products, total }` / `{ favoriteProductIds, total }`) locally — only the offset arithmetic is shared (`shared/utils/pagination.utils.ts`).
- No `AppConfigService` wrapper class. `src/shared/config/env.config.ts`'s `AppEnv` class (`class-validator`) is the source of truth for env shape (required/optional, type, format); `.env.sample` must stay in sync with it. Each value is still read where it is used, via `configService.get('NAME', { infer: true })` with a literal string key — a new variable means adding it to the schema and `.env.sample` in the same change.
