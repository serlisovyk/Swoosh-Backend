---
name: mongoose-models
description: Use when adding or changing Swoosh Server Mongoose schemas, model fields, indexes, references, embedded subdocuments, enum fields, or the visibility of sensitive fields.
---

# Mongoose Models

## When to use

Creating a collection, adding or changing a field, adding an index or reference, or deciding whether a field may reach a public response. Read `ai/rules/architecture.md` (Persistence) first. Reference implementations: `src/modules/products/models/product.model.ts` (richest) and `src/modules/users/models/user.model.ts` (sensitive fields).

## File shape

- One file per collection: `src/modules/<feature>/models/<name>.model.ts`.
- Decorated class + exported schema, always in this order:

```ts
@Schema({ timestamps: true })
export class Product {
  _id!: string

  @Prop({ required: true, trim: true, index: true })
  title!: string
}

export const ProductSchema = SchemaFactory.createForClass(Product)
```

- `@Schema({ timestamps: true })` on every collection — `createdAt`/`updatedAt` come from Mongoose, never hand-rolled.
- Declare `_id!: string` on the class so the type is usable without casting.
- Export name is always `<ClassName>Schema`.
- Feature modules register schemas with `MongooseModule.forFeature`; models never open connections.

## Field conventions

- **Strings**: add `trim: true`. Add `lowercase: true` for emails and other case-insensitive keys.
- **Required vs optional**: `required: true` with `field!: T`; optional fields get a `default` and `field?: T`.
- **Nullable**: `@Prop({ type: T, default: null })` with `field?: T | null` — an explicit null, not `undefined`.
- **Numbers** with a floor: `min: 0`.
- **Arrays**: `@Prop({ type: [T], default: [] })` — never leave an array without a default.
- **Enums**: `@Prop({ type: String, enum: Object.values(ROLES), default: ROLES.USER })`, enum declared in `<feature>.types.ts`.
- **References**: `@Prop({ type: MongooseSchema.Types.ObjectId, ref: Product.name, ... })` — use `Model.name`, never a hardcoded string. Array refs use `type: [MongooseSchema.Types.ObjectId]`.
- **Embedded subdocuments**: embed the generated schema (`type: [ProductColorSchema]`) for arrays; embed the class (`type: Address, default: {}`) for a single nested object.
- Cross-module model imports use the `@modules/*` alias — but only to import the model **class** for typing or `ref:` (as `user.model.ts` does with `Product` and `auth.types.ts` does with `User`). This is not license to `@InjectModel` a foreign model into your service.
- **A service injects `@InjectModel` only for models its own module owns.** Data another module owns is read/written only through that module's exported service — never via a direct `@InjectModel` of its model. See [decisions/no-cross-module-model-injection](../decisions/2026-09-11-no-cross-module-model-injection.md); `favorites` (now calling `UsersService`/`ProductsService`) is the reference example — it was the one exception in the repo, and it was revoked, not extended.

## Sensitive fields — `select: false`

This is how the project keeps secrets out of responses. Any field that must never leave the server by default gets `select: false`:

```ts
@Prop({ required: true, select: false })
password!: string

@Prop({ type: String, default: null, select: false })
resetPasswordToken?: string | null
```

- Passwords, reset tokens, and token expiry are `select: false` — mark every new secret the same way.
- Code that genuinely needs the value must opt in explicitly (`.select('+password')`) inside a service, and must not pass the document onward.
- There are no `toJSON`/`transform` hooks in this project — do not introduce one as an alternative hiding mechanism; use `select: false` plus explicit response mapping.
- Never return a raw document from a controller; map to the public response shape (`ai/rules/architecture.md`, Responsibility Boundaries).

## Indexes

- Add `index: true` only for a field a query actually filters or sorts on (`title`, `category`, `role`, `email`, `price`, `sizes`, `material`).
- `unique: true` for natural keys (`user.email`, `newsletterSubscription.email`) — pair it with `index: true`.
- A pre-check (`findOne` before `create`) is not enough to prevent a duplicate under concurrent requests — the unique index is the actual guarantee. Catch the driver's duplicate-key error (`code === 11000`) in the service and map it to `ConflictException`, so a race lands on the documented 409 instead of an unhandled 500 (see `UsersService.create`).
- When adding an index, name the query path that justifies it (a filter in `<feature>.utils.ts` or a service lookup). Unjustified indexes cost writes.
- **Array/multikey fields** (e.g. `Product.sizes`, a `number[]`): `index: true` on the `@Prop` still works — Mongoose creates a multikey index, used by both `distinct()` and `$in` filters against the array.
- **Fields inside an embedded subdocument array** (e.g. `Product.colors: ProductColor[]`): put `index: true` on the field inside the *subdocument's own* schema (`ProductColor.name`), not on the parent array prop. That produces the equivalent of a top-level `colors.name` index.
- **Timestamps fields** (`createdAt`/`updatedAt` from `@Schema({ timestamps: true })`): they are not class-declared props, so `index: true` cannot be attached via `@Prop`. If one is a real sort/filter path (e.g. `newest`/`oldest` sort), add it as an explicit schema-level index after `SchemaFactory.createForClass`: `ProductSchema.index({ createdAt: -1 })`.
- An **anchored** regex filter (`^...$`, as used for exact-match `$in` filters like `colorName`/`material`) can use a normal index. An **unanchored** "contains" regex (as used for the `search` `$or` filter) cannot — that needs a `$text` index instead, which is a different match semantic (word-tokenized, not substring) and changes the public search contract; see `ai/decisions/2026-09-11-products-filters-search-and-cache.md` for why this repo kept regex search over switching.
- Document new collections, fields, and indexes when they change — see `ai/rules/definition-of-done.md`.

## Verification

- `npm run lint`.
- `npm run build` — required when a model, ref, or module registration changed.
- No test suite; verify field/index behavior by reasoning against the query paths that use them.
