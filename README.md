# Swoosh Server

Standalone NestJS backend for the Swoosh store API.

## Stack

- NestJS 11
- TypeScript
- MongoDB with Mongoose
- JWT auth with Passport
- Cloudflare Turnstile on auth forms
- Resend email for password reset
- Swagger/OpenAPI

## Auth Model

- Access tokens are returned in JSON responses from `POST /auth/register`, `POST /auth/login`, and `POST /auth/new-tokens`.
- Protected endpoints expect `Authorization: Bearer <accessToken>`.
- Refresh tokens are stored in the `refreshToken` HttpOnly cookie.
- `POST /auth/new-tokens` reads the refresh cookie and returns a new access token.
- `POST /auth/logout` clears the refresh cookie.
- Google/GitHub OAuth, email verification, and server-side auth sessions are intentionally not part of this backend.

Because refresh tokens are stateless, logout does not revoke already issued refresh tokens before expiry. Add a token version or blacklist only if early server-side revocation becomes a real requirement.

## Setup

Install dependencies:

```bash
bun install
```

Create `.env` from `.env.sample` and fill the backend values.

Mongo connection is a single `MONGO_URI` env var — paste the connection string as-is from Atlas (or any Mongo host), no assembly from separate parts.

Start development server:

```bash
bun run start:dev
```

The API uses the global prefix `/api/v1`.

Swagger is available at:

```text
http://localhost:4000/api/v1/docs
```

In dev it's open. Outside dev (`NODE_ENV` other than `development`) it
requires HTTP Basic auth — set `SWAGGER_USER`/`SWAGGER_PASSWORD`, or the app
refuses to start. Set `SWAGGER_ENABLED=false` to turn the docs route off
entirely (404 instead of a login prompt).

`GET /api/v1` returns a welcome message; `GET /api/v1/health` is a public liveness check (`{ status: 'ok', timestamp }`, no dependency checks) — both unauthenticated and exempt from rate limiting, meant for uptime monitors and load balancers.

## Checks

```bash
bun run lint
bun run build
```

This backend has no automated test suite.

## Docker

Build and run the app in a container:

```bash
docker build -t swoosh-server .
docker compose up
```

`docker compose up` starts only the `app` service (`MONGO_URI` in `.env` already
points at Atlas — no local database needed). An optional `mongo` service is
available behind a Compose profile for local development without Atlas:

```bash
docker compose --profile local-db up
```

The image runs as the non-root `node` user; `.env` is never baked into the
image (`.dockerignore`), only passed in at runtime via `env_file`.
