# Spec: User.address embedded schema options

## Problem

`Address` (`src/modules/users/models/user-address.model.ts`) is embedded as a single-nested subdocument on `User.address` (`@Prop({ type: Address, default: {} })`). Its `@Schema({ timestamps: true })` decorator is the schema-options convention for **top-level collections**, not for an embedded object. Applied here it makes Mongoose give every `User.address` subdocument its own auto-generated `_id` (ObjectId) and its own `createdAt`/`updatedAt` — none of which are read, used, or exposed anywhere.

`ProductColor` (`src/modules/products/models/product-color.model.ts`) is the project's existing embedded-object convention: `@Schema({ _id: false, versionKey: false })`. `Address` should match it.

## Contract change

`user-address.model.ts`:

```diff
-@Schema({ timestamps: true })
+@Schema({ _id: false, versionKey: false })
 export class Address {
```

Effect on the stored data shape:

- **New/updated `User` documents going forward**: `address` no longer gets its own `_id`, `createdAt`, `updatedAt`, or `__v`. Only the six real fields (`company`, `region`, `city`, `street`, `zip`, `buildingNumber`) are stored.
- **Existing `User` documents already in the database**: unaffected until the document is next saved. Their `address._id`/`address.createdAt`/`address.updatedAt` remain until then. Not migrated as part of this change — see `ai/decisions/2026-09-12-user-address-not-migrated.md`.

## Public API surface

No change. `UsersAddressResponseDocs` (`users.swagger.ts`) and `UpdateAddressDto`/`UpdateUserDto` already only declare the six real address fields — none of them ever documented or accepted `_id`/`createdAt`/`updatedAt`. Verified by reading both files; no Swagger/DTO edit needed.

## Out of scope

- Migrating already-stored documents (`$unset` cleanup) — separate decision if needed later.
- Changing the address fields themselves.
