# Plan: Product category CRUD (admin API)

Linear: MY-62 · Spec: `ai/superpowers/specs/2026-09-12-my-62-category-crud.md`

## Commit breakdown

1. **docs(ai): spec + plan for MY-62 category CRUD** — this spec + this plan,
   committed together, before any code.

2. **refactor(products): move category model into `products/category/`**
   - Move `products/models/product-category.model.ts` →
     `products/category/models/product-category.model.ts` (no content change).
   - Update the import path in `product.model.ts`, `products.module.ts`,
     `products.service.ts`, `products.types.ts`.
   - `bun run build` must stay green — this is a pure path move.

3. **feat(products/category): add category CRUD (create, rename, list, delete)**
   - `category/product-category.constants.ts` — name validation errors,
     not-found error (moved/renamed from `products.constants.ts`'s
     `PRODUCT_CATEGORY_NAME_*_ERROR` / `PRODUCT_CATEGORY_NOT_FOUND_ERROR`,
     kept under the same `PRODUCT_CATEGORY_*` prefix), plus the new
     duplicate-name and in-use conflict errors, and
     `updateProductCategoryOptions`.
   - `category/dto/create-product-category.dto.ts` — the original file,
     moved as-is (same validators, same `CreateProductCategoryDto` class
     name), with `ProductCategoryNamePropertyDocs` added for Swagger (it had
     none before).
   - `category/dto/update-product-category.dto.ts` — `extends
     CreateProductCategoryDto` (`name` stays required; same pattern as
     `UpdateNewsletterSubscriptionDto`).
   - `category/product-category.service.ts` — `ProductCategoryService`:
     `findAll` (sorted by `name`, no pagination), `create`, `update`, `remove`
     (delete-in-use check via `ProductsService.existsWithCategory`, then
     delete); duplicate-name (`11000`) mapped to `409` on create/rename.
   - `category/product-category.swagger.ts` — Russian `description`/`summary`
     (new file, not a partial translation of the already-English
     `products.swagger.ts`), reusing `ProductsCategoryResponseDocs` for the
     response shape.
   - `category/product-category.controller.ts` — `ProductCategoryController`,
     `@Controller('products/categories')`, all four routes under
     `@Auth(ROLES.ADMIN)`.
   - `products.service.ts` — add `existsWithCategory(categoryId)`.
   - `products.constants.ts` — remove the three constants moved to
     `product-category.constants.ts`; keep `PRODUCT_CATEGORY_ID_ERROR` and
     `PRODUCT_CATEGORY_ID_EXAMPLE` (they describe a product's own `categoryId`
     field, not the category resource itself).
   - `products.module.ts` — register `ProductCategoryController`/
     `ProductCategoryService` in the existing `ProductsModule`.
   - Both the sub-feature's files and its exported symbols carry the
     `product-category`/`ProductCategory` prefix rather than a bare
     `category.*` — deliberate (author feedback during review), so this
     "category" never collides with an unrelated one in another module.

4. **docs(ai): document the category CRUD structure**
   - `ai/map.md` — `products` row gets the `category/` sub-folder mention.
   - `ai/rules/auth-and-api-contracts.md` — the four new admin-only routes
     have no public counterpart to list, but the module note about
     `GET /products/filters` vs. the new admin list is worth a line so the
     distinction isn't rediscovered later.
   - `ai/skills/mongoose-models.md` reference path for `ProductCategory` if it
     names the old `products/models/` location.

## Verification

- `bun run lint`
- `bun run build` (file moved, model import paths changed, new module wiring)
- Manual reasoning: create category → create product in it → attempt delete
  (expect 409) → delete product → delete category (expect success); duplicate
  name on create and on rename (expect 409); existing `GET /products/filters`
  and product create/update untouched.
