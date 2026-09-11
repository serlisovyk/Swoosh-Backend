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
npm install
```

Create `.env` from `.env.sample` and fill the backend values.

Mongo connection is a single `MONGO_URI` env var — paste the connection string as-is from Atlas (or any Mongo host), no assembly from separate parts.

Start development server:

```bash
npm run start:dev
```

The API uses the global prefix `/api/v1`.

Swagger is available at:

```text
http://localhost:4000/api/v1/docs
```

## Checks

```bash
npm run lint
npm run build
```

This backend has no automated test suite.
