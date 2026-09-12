# Spec: Product category CRUD (admin API)

Linear: MY-62

## Problem

Product categories have no endpoints at all — no create, rename, delete, or a
plain list for the admin UI. `ProductsService.findCategoryById` only reads a
category by id while creating/updating a product. `dto/create-product-category.dto.ts`
already exists but is dead code — nothing imports it.

## Decision

Add a full CRUD for categories, structured as a sub-folder inside `products`
(`src/modules/products/category/`), following the `auth` → `auth/password-reset`
precedent (MY-54): no separate `@Module`, the new controller/service register
directly in `ProductsModule.controllers`/`providers`. A category has no
lifecycle without `products`, and `ProductsModule` already owns the
`ProductCategory` schema — a second Nest module would only add ceremony.

## Public contract

All four endpoints are **admin-only** (`@Auth(ROLES.ADMIN)`), under
`@Controller('products/categories')`:

- `GET /products/categories` — every category (including ones with no
  products), sorted by `name`. No pagination — this is an admin management
  list, not the product catalog.
- `POST /products/categories` — create. Body: `{ name: string }`.
- `PUT /products/categories/:id` — rename. Body: `{ name: string }`.
- `DELETE /products/categories/:id` — delete. Returns `409 Conflict` (not a
  cascade, not a silent success) when any product still references the
  category.

Response shape reuses the existing `ProductsCategoryResponseDocs`
(`_id`, `name`, `createdAt`, `updatedAt`) already used to document a
product's embedded category.

This is **not** the same thing as the existing public `GET /products/filters`,
which keeps returning only categories that currently have at least one
product (catalog filter metadata). The two stay separate; `GET
/products/categories` is the only one addressed by this change.

## Behavior

- **Delete-in-use check**: `ProductsService` gets a new method,
  `existsWithCategory(categoryId): Promise<boolean>`, checking whether any
  product references the category. The new `CategoryService` calls it before
  deleting; a category still in use throws `ConflictException`. Without this
  check, deleting a category would leave products with a dangling `category`
  ref, and `populate('category', ...)` in `ProductsService.findAll`/`findById`
  would start silently returning `null` instead of a category.
- **Duplicate name**: `ProductCategory.name` already has a `unique` index.
  Create and rename both catch the driver's duplicate-key error (code
  `11000`) and map it to `409 Conflict` — the same pattern already used by
  `NewsletterSubscriptionService`. Without this, a duplicate name would
  surface as a raw, unhandled 500.

## Model move

`product-category.model.ts` moves from `products/models/` to
`products/category/models/product-category.model.ts`. The `ProductCategory`
class keeps its name (same `ref: ProductCategory.name` in `product.model.ts`)
— only the file's location and the import paths that point to it change.
Schema registration in `ProductsModule` (`MongooseModule.forFeature`) is
unchanged.

## Dependency direction

`ProductsService` depends on `category`'s model file (import path only,
same as before the move) and keeps its own `@InjectModel(ProductCategory.name)`
— category is not "another module" in the cross-module-model-injection sense,
it is a sub-folder of the same `ProductsModule`. `CategoryService` depends on
`ProductsService` (constructor injection) for the one `existsWithCategory`
call. `ProductsService` never depends on `CategoryService` — no cycle.

## Out of scope

- A public "all categories for site navigation" endpoint — not the same thing
  as `GET /products/filters` or the new admin list; a future task if needed.
- Any change to the `ProductCategory` schema itself (hierarchy, nesting).
- Automated tests — none exist in this repo.
