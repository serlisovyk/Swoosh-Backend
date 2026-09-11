# Spec: единый MONGO_URI и опции подключения mongoose

Issue: MY-45 · Date: 2026-09-11

## Контракт до

`src/common/mongo/mongo.utils.ts` (`getMongoString`) собирает URI вручную из шести env-переменных: `MONGO_PROTOCOL`, `MONGO_LOGIN`, `MONGO_PASSWORD`, `MONGO_HOST`, `MONGO_DB`, `MONGO_OPTIONS`. `mongo.config.ts` передаёт в `MongooseModule.forRootAsync` только `uri` — `autoIndex` остаётся дефолтным `true`, `retryAttempts` не задан.

## Контракт после

- Одна env-переменная `MONGO_URI` — читается как есть (`config.getOrThrow<string>('MONGO_URI')`), без сборки и без перекодирования частей.
- `mongo.config.ts` возвращает `MongooseModuleOptions` с:
  - `uri: config.getOrThrow<string>('MONGO_URI')`
  - `autoIndex: isDev(configService)` — индексы пересобираются только в dev, в проде это осознанный шаг
  - `retryAttempts: 3` — явное значение вместо дефолта `10`
- `mongo.utils.ts` удалён целиком, `getMongoString` больше не существует.
- Шесть старых `MONGO_*` ключей убраны из `.env.sample` и из локального `.env`.

## Кто зависит

- `MongoModule` (`mongo.module.ts`) — вызывает `getMongoConfig`, сигнатура не меняется.
- Ничего в `src/modules/*` не читает `MONGO_*` напрямую (проверено грепом) — блок-радиус ограничен `src/common/mongo`.

## Риски (из issue)

- Если `MONGO_URI` не будет проставлен в окружении при раскатке — приложение упадёт на старте (`getOrThrow`). Это ожидаемо и совпадает с текущим поведением для отсутствующих `MONGO_*`.
- `autoIndex: false` в проде — новые индексы из схем сами не появятся, нужен осознанный шаг (зафиксировано в decision record).

## Вне скоупа

- Управление индексами как процесс, миграции.
- Отдельные URI на чтение/запись, реплики.
- env-валидация схемой (следующая задача).
