# Swoosh Server

🛍️ REST API server for the Swoosh e-commerce store.

This backend provides product catalog, favorites, authentication, and public form data through a NestJS + TypeScript API. The project is organized around feature modules, with cross-cutting infrastructure and DI-free helpers kept in separate layers, DTO-based validation, a canonical error envelope, and Swagger documentation.

## ✨ Features

- JWT authentication with stateless refresh tokens in an HttpOnly cookie, and email-based password reset
- Product catalog with pagination, category/material/size/color/price filters, text search, sort, and ids lookup
- Product category management (admin)
- Favorites with optimistic-locking updates
- Public forms — contact requests, individual orders, newsletter subscriptions — with admin listing/management
- Cloudflare Turnstile captcha on auth and public form submissions
- Canonical error envelope with per-field validation messages
- Request logging with `x-request-id`
- Environment validation on startup
- Swagger UI protected outside development

## 🧰 Tech Stack

- Node.js
- NestJS 11
- TypeScript
- MongoDB
- Mongoose
- Passport JWT
- Cloudflare Turnstile
- Resend
- Swagger / OpenAPI
- Docker
- Bun

## 📁 Project Structure

```text
src/
  common/
    captcha/     Cloudflare Turnstile integration
    email/       Resend email sending, templates
    errors/      Global exception filter, canonical error envelope
    jwt/         JWT module setup
    logging/     Request logging, x-request-id
    mongo/       Mongoose connection setup
    throttler/   Rate limiting
  shared/        DI-free code: config, constants, types, utils, swagger factories
  modules/
    auth/        Login, register, tokens, password reset
    users/       Profile and address
    products/    Catalog, categories
    favorites/   User favorite products
    forms/       Contact requests, individual orders, newsletter subscriptions
    system/      Root and health endpoints
  main.ts        Bootstrap entry point
```

## 🔐 Auth Model

- Access tokens are returned in JSON responses from `POST /auth/register`, `POST /auth/login`, and `POST /auth/new-tokens`.
- Protected endpoints expect `Authorization: Bearer <accessToken>`.
- Refresh tokens are stored in the `refreshToken` HttpOnly cookie.
- `POST /auth/new-tokens` reads the refresh cookie and returns a new access token.
- `POST /auth/logout` clears the refresh cookie.
- Google/GitHub OAuth, email verification, and server-side auth sessions are intentionally not part of this backend.

Because refresh tokens are stateless, logout does not revoke already issued refresh tokens before expiry. Add a token version or blacklist only if early server-side revocation becomes a real requirement.

## ⚙️ Environment Variables

Create `.env` from `.env.sample` and fill the backend values:

```bash
cp .env.sample .env
```

Env is validated at boot against a schema (`src/shared/config/env.config.ts`) — a missing, empty, or malformed value fails startup immediately and lists every offending key at once, rather than crashing later on first use. `CORS_DOMAINS` is required outside development.

Mongo connection is a single `MONGO_URI` env var — paste the connection string as-is from Atlas (or any Mongo host), no assembly from separate parts.

## 🐳 Docker

Build and run the app in a container:

```bash
docker build -t swoosh-server .
docker compose up
```

`docker compose up` starts only the `app` service (`MONGO_URI` in `.env` already points at Atlas — no local database needed). An optional `mongo` service is available behind a Compose profile for local development without Atlas:

```bash
docker compose --profile local-db up
```

The image runs as the non-root `node` user; `.env` is never baked into the image (`.dockerignore`), only passed in at runtime via `env_file`.

## ▲ Vercel

The app can also be deployed as a Vercel serverless function, in addition to Docker:

- `vercel.json` is the whole deploy contract — `framework: null`, `buildCommand: "bun run build:vercel"`, `outputDirectory: "public"`, and the one `rewrites` rule (every path → `/api`). Nothing deploy-relevant lives in the Vercel dashboard.
- `bun run build:vercel` runs the normal `bun run build` and then creates an empty `public/` — Vercel's "Other" framework preset still expects a static output directory to exist even for a functions-only deploy. `public/` is gitignored; the build script is what creates it, both locally and on Vercel.
- `api/index.ts` is the function Vercel auto-detects; it re-exports the handler built in `src/serverless.ts`, which reuses the same `setupApp()` wiring as `src/main.ts` but calls `app.init()` instead of `app.listen()` and caches the Nest app across warm invocations.
- Set every variable from `.env.sample` in the Vercel project's environment variables (dashboard or `vercel env add`) — nothing is read from a committed `.env` file.
- See [decisions/vercel-serverless-entry](ai/decisions/2026-09-12-vercel-serverless-entry.md) for why the serverless entry is a separate file rather than a branch inside `main.ts`, and [decisions/vercel-config-in-repo](ai/decisions/2026-09-15-vercel-config-in-repo.md) for why the deploy config moved out of the dashboard.

## 🚀 Scripts

Install dependencies:

```bash
bun install
```

`bun install` also provisions a local pre-commit hook (`husky`) that runs `eslint --fix` on staged `*.ts` files via `lint-staged` — it blocks a commit that lint would fail.

Run in development mode:

```bash
bun run start:dev
```

Build:

```bash
bun run build
```

Run the compiled app:

```bash
bun run start:prod
```

Lint:

```bash
bun run lint
```

Enforces formatting (Prettier), no floating promises, no unsafe arguments, and no `any` as build-failing errors, not warnings. Build runs with TypeScript `strict` mode plus `noUncheckedIndexedAccess`.

Format:

```bash
bun run format
```

There is no automated test suite; lint and build are the verification.

## 🔌 API Endpoints

All routes are served under the global prefix `/api/v1`.

### Auth

```text
POST /auth/register
POST /auth/login
POST /auth/new-tokens
POST /auth/logout
POST /auth/request-password-reset
POST /auth/reset-password
```

### Profile

```text
GET /profile
PUT /profile
```

### Products

`GET /products` supported query parameters:

| Parameter | Type | Description |
| --- | --- | --- |
| `page` | number | Page number, starts from 1 |
| `limit` | number | Page size, up to 100 |
| `search` | string | Text search |
| `sort` | string | Sort option |
| `category`, `material`, `colorName` | string[] | Filter by these fields |
| `size`, `price` | number[] | Filter by size / price range |
| `isHit`, `isNewArrival`, `hasDiscount` | boolean | Filter flags |
| `ids`, `excludeIds` | string[] | Include/exclude specific product ids |

```text
GET /products/filters
GET /products/:id
POST /products          (admin)
PUT /products/:id       (admin)
DELETE /products/:id    (admin)
```

### Product Categories (admin)

```text
GET /products/categories
POST /products/categories
PUT /products/categories/:id
DELETE /products/categories/:id
```

### Favorites

```text
GET /favorites
PUT /favorites/:productId
DELETE /favorites/:productId
```

### Forms

Each of `forms/contact-requests`, `forms/individual-orders`, `forms/newsletter-subscriptions` exposes the same shape — public submission, admin listing/management:

```text
POST /forms/<resource>
GET /forms/<resource>
GET /forms/<resource>/:id
PUT /forms/<resource>/:id
DELETE /forms/<resource>/:id
```

### System

```text
GET /            Welcome message
GET /health      Liveness check — { status, timestamp }, unauthenticated, exempt from rate limiting
```

## ❌ Error Format

The API returns errors in a consistent shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid query parameters",
    "fields": {
      "page": "Invalid input: expected number, received string"
    }
  }
}
```

Validation errors that relate to the whole object instead of a specific field are placed under the `_root` key.

## 🧱 Architecture Notes

- `common/` holds anything that instantiates the Nest DI container (modules, providers, global filters/guards); `shared/` holds code with no DI involvement (config, constants, utils, types, swagger decorator factories).
- A module only injects its own Mongoose models — data owned by another module is reached through that module's service, never through a direct `@InjectModel`.
- Every feature module keeps its own DTOs and a co-located `*.swagger.ts` next to the controller/service.
- A global `AllExceptionsFilter` normalizes every thrown error into the canonical envelope above.
- Every request gets an `x-request-id` (generated or forwarded), logged alongside method/path/status/duration and echoed back in the response.
