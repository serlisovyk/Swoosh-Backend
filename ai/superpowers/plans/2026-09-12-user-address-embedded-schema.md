# Plan: MY-69 — User.address embedded schema without _id/timestamps

Spec: `ai/superpowers/specs/2026-09-12-user-address-embedded-schema.md`

## Verified before implementing

- `UsersAddressResponseDocs` and `UpdateAddressDto`/`UpdateUserDto` (`src/modules/users/users.swagger.ts`, `src/modules/users/dto/*.ts`) declare only `company`/`region`/`city`/`street`/`zip`/`buildingNumber` — no `_id`/`createdAt`/`updatedAt` anywhere in the address surface. No DTO/Swagger edit needed.
- No code reads `address._id`/`address.createdAt`/`address.updatedAt` anywhere in `src/` (grepped).
- `ai/map.md`'s `users` row doesn't describe schema options, so no edit needed there.

## Commits

1. **Docs**: this plan + spec + a new decision record (`ai/decisions/2026-09-12-user-address-not-migrated.md`, recording the deliberate choice not to migrate already-stored documents). Docs only, before any code.
2. **Code**: `user-address.model.ts` — `@Schema({ timestamps: true })` → `@Schema({ _id: false, versionKey: false })`.
3. **Docs**: `ai/skills/mongoose-models.md` — add `Address` as a second embedded-object example alongside `ProductColor`.

## Verification

- `bun run lint`
- `bun run build`
- Manual reasoning (no test suite, no local Mongo write in this session): confirm the schema option change is the only thing that determines subdocument `_id`/timestamp generation in Mongoose, and that nothing else in the codebase depends on their presence.

## Out of scope (per issue)

- Migrating existing stored documents.
- Changing address fields.
