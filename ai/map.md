# Repo map

Orientation in one read — so `src/` does not have to be rediscovered every session.

**Reference module:** `src/modules/products` — the fullest example of house style (query DTO, options builder, constants, types, swagger). Copy its shape.

**Path aliases:** `@modules/*` → `src/modules/*`, `@common/*` → `src/common/*`, `@shared/*` → `src/shared/*`.

## App level

| File | What it does |
|---|---|
| `src/main.ts` | global prefix `api/v1`, `setupValidation` (global ValidationPipe), `setupSwagger`, `cookie-parser`, `helmet`, `enableCors` (origins from `CORS_DOMAINS`, credentials enabled), `x-powered-by` disabled, `PORT` via `getOrThrow` |
| `src/app.module.ts` | `ConfigModule` (global), `MongoModule`, `ThrottlerModule`, `CaptchaModule` + the feature modules |

## Feature modules (`src/modules`)

| Module | What it does | Entry files |
|---|---|---|
| `auth` | register / login / new-tokens / logout, guards, JWT strategy, decorators. No schema of its own — reuses `User` | `auth.controller.ts`, `auth.service.ts`, `guards/jwt.guard.ts`, `guards/roles.guard.ts`, `strategies/jwt.strategy.ts`, `decorators/{auth,roles,user}.decorator.ts`, `jwt.config.ts`, `auth.constants.ts` |
| `auth/auth-account` | password reset: request and confirm | `auth-account.controller.ts`, `auth-account.service.ts`, `dto/` |
| `user` | profile, address; **the source of `ROLES`** | `user.controller.ts`, `user.service.ts`, `models/user.model.ts`, `models/user-address.model.ts`, `user.types.ts` |
| `products` | catalog + list endpoint with filtering, sorting, pagination (**reference implementation**); exports `ProductsService` for other modules | `products.utils.ts` (`buildProductListQueryOptions`, regex helpers), `products.constants.ts` (`PRODUCT_SORT_MAP`, `DEFAULT_PRODUCTS_LIMIT`), `dto/find-all-products.dto.ts`, `models/{product,product-category,product-color}.model.ts` |
| `favorites` | favorites list; no schema of its own — depends on `UserModule`/`ProductsModule` and calls `UserService`/`ProductsService`, never injects their models directly | `favorites.service.ts`, `favorites.utils.ts` (pagination/meta), `dto/find-all-favorites.dto.ts` |
| `forms` | aggregator over three sub-modules: `contact-request`, `individual-order`, `newsletter-subscription` — each its own folder with the full anatomy (controller/service/module/dto/models/utils/types/constants/swagger) | `forms.module.ts` + one folder per form |
| `system` | public root (`GET /api/v1`) and liveness health check (`GET /api/v1/health`); no schema, no auth, `@SkipThrottle()` on both | `system.controller.ts`, `system.service.ts`, `system.types.ts`, `system.swagger.ts` |

## Cross-cutting (`src/common`)

| Package | What it provides |
|---|---|
| `captcha` | Cloudflare Turnstile wrapper; the `@Captcha()` decorator — applied on auth and password-reset endpoints |
| `throttler` | global `ThrottlerGuard` registered as `APP_GUARD`; TTL/limit from env, `skipIf` in dev; tightened per route with `@Throttle` |
| `email` | Resend + `@react-email/render`; templates in `templates/*.template.tsx` (currently `reset-password`), subjects in `email.constants.ts`; a send failure (provider error or rejected promise) is logged with recipient/subject/provider detail and rethrown as `InternalServerErrorException(EMAIL_SEND_FAILED_ERROR)` — callers never see the provider's own error |
| `errors` | canonical error envelope: `AllExceptionsFilter` (global, wired in `main.ts`), `ValidationFailedException` + `flattenValidationErrors` (used by the global `ValidationPipe`'s `exceptionFactory`), `ERROR_CODES`, `ErrorResponseDocs` for Swagger |
| `mongo` | the single connection: `MongooseModule.forRootAsync` (`mongo.config.ts`) |
| `swagger` | `config/swagger.config.ts` (DocumentBuilder, bearer + cookie auth, operationId, the `SWAGGER_ENABLED`/basic-auth gate outside dev), `utils/swagger.utils.ts` (`createPropertyDocsDecorator`, `createOptionalPropertyDocsDecorator`, `addSwaggerCookieAuth`, `QueryPagePropertyDocs`/`QueryLimitPropertyDocs` — shared page/limit query-param docs, parametrized per module), `utils/swagger-basic-auth.utils.ts` (`createSwaggerBasicAuthMiddleware`), `common-responses.swagger.ts` (`ApiAuthRequiredDocs`, `ApiValidationErrorDocs`, `ApiInvalidQueryDocs`, `ApiNotFoundDocs` — shared helpers for repeated `Api*Response` text) |

## Shared (`src/shared`)

| File | What it provides |
|---|---|
| `config/validation.config.ts` | `setupValidation` — the global ValidationPipe: `whitelist`, `transform`, `forbidNonWhitelisted` |
| `utils/query.utils.ts` | query-param coercion: `toStringArrayQueryParam`, `toNumberArrayQueryParam`, `toBooleanQueryParam`, `trimStringValue`, `normalizeEmailValue` |
| `utils/{phone,env,app}.utils.ts` | `normalizePhoneValue`; `isDev` / `parseCorsDomainsConfigValue`; `noop` |
| `utils/pagination.utils.ts` | `resolvePaginationOffset(page, limit)` + `DEFAULT_PAGE` — the shared offset formula used by `products` (Mongo `skip`/`limit`) and `favorites` (in-memory slice); each module keeps its own default `limit` and pagination mechanism |
| `constants/env.constants.ts` | only the `NODE_ENV` as-const values — **not** a registry of env variable names |
| `constants/time.constants.ts` | `THIRTY_MINUTES_IN_MS`, `ONE_HOUR_IN_MS`, `ONE_DAY_IN_MS` |

## What this project does NOT have (do not invent it)

- No global interceptors — see [decisions/error-envelope-target](decisions/2026-09-09-error-envelope-target.md) (the global exception filter is implemented; interceptors are not).
- No dedicated logger — `AllExceptionsFilter` uses Nest's built-in `Logger` for 5xx errors, not a request-scoped one.
- No automated tests — see [decisions/no-test-suite](decisions/2026-09-09-no-test-suite.md).
- No `toJSON`/`transform` hooks on models — secrets are hidden with `select: false`, see [skills/mongoose-models](skills/mongoose-models.md).
- No shared pagination-**meta** helper: `products` and `favorites` each build their own list response (`{ products, total }` / `{ favoriteProductIds, total }`) locally — only the offset arithmetic is shared (`shared/utils/pagination.utils.ts`).
- No central registry of env variable names. Each value is read where it is used via `configService.getOrThrow<T>('NAME')` with a literal string; `.env.sample` is the de-facto contract, so a new variable means updating it in the same change.
