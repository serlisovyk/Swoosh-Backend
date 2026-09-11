# Plan: индексы Product + кэш findFiltersMetadata

Issue: MY-63 · Branch: `serlesovik/my-63-products-indeksi-pod-filtrisortirovku-kesh`

## Решения (зафиксировать как decision-record)

1. **Search остаётся regex, не `$text`.** `$text` меняет семантику (word-tokenized vs substring) — публичный контракт поиска, менять нельзя без фронта. Текстовый индекс не добавляется.
2. **Кэш `findFiltersMetadata`: in-memory TTL, 60 сек, без event-инвалидации.** Простейший вариант из трёх предложенных в issue; эндпоинт публичный/неавторизованный/без параметров — детерминирован в рамках TTL-окна. Событийная инвалидация добавила бы связность (create/update/remove должны знать про кэш) ради точности, которая тут не нужна — 60 сек устаревания для списка размеров/материалов/цветов/категорий приемлемо (сам issue называет это допустимым для фильтров). Не переживает рестарт/несколько инстансов — принято, это единственный процесс без балансировки на текущем этапе (нет Redis, не заводим его ради этого тикета).

## Commit breakdown

1. **docs(ai): spec + plan for MY-63** — этот файл + spec, один коммит, до кода.
2. **feat(products): add indexes for filters/sort fields** — `product.model.ts` (`sizes`, `material`, `price` — `index: true`; explicit `ProductSchema.index({ createdAt: -1 })`), `product-color.model.ts` (`name` — `index: true`, даёт multikey `colors.name`).
3. **feat(products): in-memory TTL cache for findFiltersMetadata** — `products.constants.ts` (`FILTERS_METADATA_CACHE_TTL_MS`), `products.service.ts` (приватное поле кэша + чтение/запись в `findFiltersMetadata`).
4. **docs(ai): record decisions + update skills/map for MY-63** — `ai/decisions/2026-09-11-products-filters-search-and-cache.md`, `ai/skills/mongoose-models.md` (новые индексы), `ai/skills/performance-review.md` (кейс как эталонный).

## Детали реализации

### Индексы

- `Product.sizes`: `@Prop({ type: [Number], default: [], index: true })` — multikey, используется в `distinct('sizes')` и `$in` фильтре.
- `Product.material`: `@Prop({ default: '', trim: true, index: true })` — используется в `distinct('material', ...)` и `$in` фильтре.
- `Product.price`: `@Prop({ required: true, min: 0, index: true })` — диапазонный фильтр + сортировка `priceAsc`/`priceDesc`.
- `createdAt`: нет class-поля (приходит из `timestamps: true`), поэтому индекс через `ProductSchema.index({ createdAt: -1 })` после `SchemaFactory.createForClass` — сортировка `newest`/`oldest`.
- `ProductColor.name`: `@Prop({ required: true, trim: true, index: true })` — индекс на вложенном поле создаёт multikey `colors.name`, используется в `distinct('colors.name', ...)` и `$in` фильтре.
- `colors.name` фильтруется через regex (`createExactRegex`, anchored `^...$` без флагов кроме `i`) — anchored regex **может** использовать индекс (в отличие от `search`, который unanchored). Индекс всё равно оправдан прежде всего для `distinct`.

### Кэш

- Константа в `products.constants.ts`: `export const FILTERS_METADATA_CACHE_TTL_MS = 60_000`.
- В `ProductsService`: приватное поле `private filtersMetadataCache: { data: ProductFiltersMetadata; expiresAt: number } | null = null`.
- В начале `findFiltersMetadata()`: если `this.filtersMetadataCache` есть и `Date.now() < expiresAt` — вернуть `data` без запросов к Mongo.
- В конце — посчитать результат как сейчас, записать в `this.filtersMetadataCache = { data: result, expiresAt: Date.now() + FILTERS_METADATA_CACHE_TTL_MS }`, вернуть `result`.
- Без инвалидации по `create`/`update`/`remove` — осознанно (см. решение выше).

## Проверка

- `npm run lint`
- `npm run build`
- Ручной прогон (если поднимается Mongo локально): `GET /products/filters` дважды подряд — второй раз без новых Mongo-запросов (лог/время ответа); после 60 сек — пересчёт.
- Ревью diff моделей — индексы совпадают с полями из issue.

## Вне скоупа

- Кэш `GET /products`, CRUD категорий, изменение бизнес-логики фильтрации — не трогать (см. spec).
- Применение индексов в проде при `autoIndex: false` (MY-45) — отдельный операционный шаг, не часть этого тикета.
