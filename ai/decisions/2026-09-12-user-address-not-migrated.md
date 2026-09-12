# User.address schema fix is not retroactive

## Context

`Address` (`src/modules/users/models/user-address.model.ts`) was missing `_id: false`/`versionKey: false`, so every `User.address` subdocument got an unused auto-generated `_id` and its own `createdAt`/`updatedAt`. Fixed by matching the project's existing embedded-object convention (`ProductColor`).

## Decision

Fix the schema going forward only. Do not migrate already-stored `User` documents to strip their existing `address._id`/`address.createdAt`/`address.updatedAt`.

## Consequences

- Documents saved before this change keep their stale `address._id`/`address.createdAt`/`address.updatedAt` fields until that document is next written (at which point Mongoose stops regenerating them, since the field is simply no longer part of the schema going forward — existing values are untouched by a partial update that doesn't touch `address`).
- No `$unset` migration script exists for this. If a full cleanup of historical data is wanted later, it is a separate, explicit task.
