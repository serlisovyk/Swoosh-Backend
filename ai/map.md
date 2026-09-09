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
| `products` | catalog + list endpoint with filtering, sorting, pagination (**reference implementation**) | `products.utils.ts` (`buildProductListQueryOptions`, regex helpers), `products.constants.ts` (`PRODUCT_SORT_MAP`, `DEFAULT_PRODUCTS_LIMIT`), `dto/find-all-products.dto.ts`, `models/{product,product-category,product-color}.model.ts` |
| `favorites` | favorites list; no schema of its own — registers `User` + `Product` | `favorites.service.ts`, `favorites.utils.ts` (pagination/meta), `dto/find-all-favorites.dto.ts` |
| `forms` | aggregator over three sub-modules: `contact-request`, `individual-order`, `newsletter-subscription` — each its own folder with the full anatomy (controller/service/module/dto/models/utils/types/constants/swagger) | `forms.module.ts` + one folder per form |

## Cross-cutting (`src/common`)

| Package | What it provides |
|---|---|
| `captcha` | Cloudflare Turnstile wrapper; the `@Captcha()` decorator — applied on auth and password-reset endpoints |
| `throttler` | global `ThrottlerGuard` registered as `APP_GUARD`; TTL/limit from env, `skipIf` in dev; tightened per route with `@Throttle` |
| `email` | Resend + `@react-email/render`; templates in `templates/*.template.tsx` (currently `reset-password`) |
| `mongo` | the single connection: `MongooseModule.forRootAsync` (`mongo.config.ts`) |
| `swagger` | `config/swagger.config.ts` (DocumentBuilder, bearer + cookie auth, operationId), `utils/swagger.utils.ts` (`createPropertyDocsDecorator`, `createOptionalPropertyDocsDecorator`, `addSwaggerCookieAuth`) |

## Shared (`src/shared`)

| File | What it provides |
|---|---|
| `config/validation.config.ts` | `setupValidation` — the global ValidationPipe: `whitelist`, `transform`, `forbidNonWhitelisted` |
| `utils/query.utils.ts` | query-param coercion: `toStringArrayQueryParam`, `toNumberArrayQueryParam`, `toBooleanQueryParam`, `trimStringValue`, `normalizeEmailValue` |
| `utils/{phone,env,app}.utils.ts` | `normalizePhoneValue`; `isDev` / `parseCorsDomainsConfigValue`; `noop` |
| `constants/{env,time}.constants.ts` | env variable names and time constants |

## What this project does NOT have (do not invent it)

- No global interceptors and no exception filters — see [decisions/error-envelope-target](decisions/2026-09-09-error-envelope-target.md).
- No dedicated logger.
- No automated tests — see [decisions/no-test-suite](decisions/2026-09-09-no-test-suite.md).
- No `toJSON`/`transform` hooks on models — secrets are hidden with `select: false`, see [skills/mongoose-models](skills/mongoose-models.md).
- No shared pagination-meta helper: `products` and `favorites` each compute it locally.
