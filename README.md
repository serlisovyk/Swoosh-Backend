# Swoosh Backend

Backend API for the Swoosh project.

Built with NestJS, TypeScript, MongoDB, Mongoose, JWT auth, Swagger, and Resend.

Access tokens stay stateless, while refresh-token rotation is backed by server-side `auth_sessions` records so logout and future device/session management can revoke refresh access reliably.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a local `.env` file from `.env.sample`.

Main groups of variables:

- app settings
- JWT settings
- OAuth provider settings
- email verification token settings
- captcha settings
- MongoDB connection settings
- email settings
- throttling settings

See `.env.sample` for the full list.

Login, register, request-password-reset, and reset-password endpoints are protected with Cloudflare Turnstile and expect the captcha token in the `cf-turnstile-token` request header.
Register now also sends an email verification link, so the backend must have working email and email-verification token settings configured.
Google and GitHub sign-in require OAuth client credentials plus a `SERVER_URL` that points to the public API base URL including `/api/v1`, because provider callbacks resolve to `/auth/google/callback` and `/auth/github/callback` under that prefix.
Users authenticated through Google or GitHub are treated as email-verified when the provider returns a verified email, so the regular verification-email gate is skipped for them.
Profile write access now depends on verified email, while `/profile` read access still works for newly registered users.

### 3. Start the app

```bash
npm run start:dev
```

The API uses the global prefix:

```text
/api/v1
```

Swagger is usually available at:

```text
http://localhost:4000/api/v1/docs
```

## Structure

```text
src/
|-- common/                     # shared infrastructure
|   |-- captcha/                # Cloudflare Turnstile module and config
|   |-- email/                  # email service and templates
|   |-- mongo/                  # Mongo connection module and config
|   |-- swagger/                # Swagger setup helpers
|   `-- throttler/              # throttling module and config
|-- modules/                    # business modules
|   |-- auth/                   # authentication and token flow
|   |-- favorites/              # user favorites state and favorites list
|   |-- forms/                  # public forms and admin form management
|   |-- products/               # products CRUD and filtering
|   `-- user/                   # user profile and account data
|-- shared/                     # shared app-level helpers
|   |-- config/                 # shared bootstrap helpers
|   |-- constants/              # global constants
|   `-- utils/                  # shared utilities
|-- app.module.ts
`-- main.ts
```
