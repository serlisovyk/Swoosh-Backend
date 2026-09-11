# Single MONGO_URI over six-part assembly

Date: 2026-09-11 · Status: accepted

## Context

The Mongo connection string used to be built by hand in `src/common/mongo/mongo.utils.ts` from six env vars: `MONGO_PROTOCOL`, `MONGO_LOGIN`, `MONGO_PASSWORD`, `MONGO_HOST`, `MONGO_DB`, `MONGO_OPTIONS`. Atlas (and every other Mongo host) already hands out a ready-to-use URI — reassembling it added six failure points and a bespoke format to remember, for no benefit. Separately, `mongo.config.ts` passed only `uri` to `MongooseModule.forRootAsync`, so `autoIndex` stayed at the Mongoose default (`true`) and indexes were rebuilt on every prod boot.

## Decision

- One env var, `MONGO_URI`, read as-is via `config.getOrThrow<string>('MONGO_URI')` — no splitting, no re-encoding of parts.
- `mongo.config.ts` sets `autoIndex: isDev(configService)` and `retryAttempts: 3` explicitly instead of relying on driver defaults.
- `mongo.utils.ts` and `getMongoString` are removed entirely.

## Consequences

- If `MONGO_URI` is missing from an environment, the app fails fast at boot (`getOrThrow`) — same failure mode as before for a missing `MONGO_*` var, just one variable instead of six to keep in sync across stands.
- `autoIndex: false` in prod means a **new index added to a schema will not appear by itself** — it needs an explicit, deliberate creation step (e.g. a one-off script or manual `createIndex`). Existing indexes on current models are already built and are unaffected.
- Password/credential encoding for special characters is the provider's problem now, not ours — the URI is taken pre-built.
- Reversing this (going back to part-based assembly) needs a new dated record here, not an edit to this one.
