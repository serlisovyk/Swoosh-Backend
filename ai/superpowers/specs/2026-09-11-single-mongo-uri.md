# Spec: single MONGO_URI and mongoose connection options

Issue: MY-45 · Date: 2026-09-11

## Contract before

`src/common/mongo/mongo.utils.ts` (`getMongoString`) builds the URI by hand from six env vars: `MONGO_PROTOCOL`, `MONGO_LOGIN`, `MONGO_PASSWORD`, `MONGO_HOST`, `MONGO_DB`, `MONGO_OPTIONS`. `mongo.config.ts` passes only `uri` to `MongooseModule.forRootAsync` — `autoIndex` stays at the default `true`, `retryAttempts` is unset.

## Contract after

- One env var `MONGO_URI` — read as-is (`config.getOrThrow<string>('MONGO_URI')`), no assembly, no re-encoding of parts.
- `mongo.config.ts` returns `MongooseModuleOptions` with:
  - `uri: config.getOrThrow<string>('MONGO_URI')`
  - `autoIndex: isDev(configService)` — indexes rebuild only in dev, in prod it's a deliberate step
  - `retryAttempts: 3` — explicit value instead of the default `10`
- `mongo.utils.ts` is removed entirely, `getMongoString` no longer exists.
- The six old `MONGO_*` keys are removed from `.env.sample` and from the local `.env`.

## Who depends on this

- `MongoModule` (`mongo.module.ts`) — calls `getMongoConfig`, signature unchanged.
- Nothing in `src/modules/*` reads `MONGO_*` directly (checked with grep) — blast radius is limited to `src/common/mongo`.

## Risks (from the issue)

- If `MONGO_URI` isn't set in an environment at deploy time — the app fails fast at boot (`getOrThrow`). Expected, same failure mode as the missing `MONGO_*` vars before.
- `autoIndex: false` in prod — new indexes from schemas won't appear by themselves, need a deliberate step (recorded in the decision record).

## Out of scope

- Index management as a process, migrations.
- Separate read/write URIs, replicas.
- env schema validation (next task).
