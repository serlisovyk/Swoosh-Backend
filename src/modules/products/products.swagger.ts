import {
  ApiAuthRequiredDocs,
  ApiInvalidQueryDocs,
  ApiValidationErrorDocs,
  ErrorResponseDocs,
} from '@common/errors'
import { applyDecorators, Type } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger'
import {
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
  QueryLimitPropertyDocs,
  QueryPagePropertyDocs,
} from '@shared/swagger'
import {
  DEFAULT_PRODUCTS_LIMIT,
  MAX_PRODUCTS_LIMIT,
  PRODUCT_ID_EXAMPLE,
  PRODUCT_CATEGORY_ID_EXAMPLE,
} from './products.constants'
import { PRODUCT_SORT_OPTIONS } from './products.types'

export function ProductsTagDocs() {
  return ApiTags('Products')
}

export const ProductsColorNamePropertyDocs = createPropertyDocsDecorator({
  description: 'Отображаемое название цвета товара.',
  example: 'Graphite',
})

export const ProductsColorHexPropertyDocs = createPropertyDocsDecorator({
  description: 'HEX-код цвета товара.',
  example: '#2F3640',
})

export const ProductsTitlePropertyDocs = createPropertyDocsDecorator({
  description: 'Название товара в каталоге.',
  example: 'Nike Air Max Pulse',
})

export const ProductsPricePropertyDocs = createPropertyDocsDecorator({
  description: 'Текущая цена товара.',
  example: 189.99,
  minimum: 0,
})

export const ProductsDescriptionPropertyDocs = createPropertyDocsDecorator({
  description: 'Подробное описание товара.',
  example: 'Breathable everyday sneakers with lightweight cushioning.',
})

export const ProductsImagesPropertyDocs = createPropertyDocsDecorator({
  description: 'Список URL изображений товара.',
  example: [
    'https://image-example.com/products/air-max-pulse/front.webp',
    'https://image-example.com/products/air-max-pulse/side.webp',
  ],
  type: [String],
  minItems: 1,
  uniqueItems: true,
})

export const ProductsOldPricePropertyDocs = createOptionalPropertyDocsDecorator(
  {
    description: 'Цена до скидки.',
    example: 229.99,
    minimum: 0,
  },
)

export const ProductsNullableOldPricePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Цена до скидки.',
    example: 229.99,
    nullable: true,
  })

export const ProductsSaleCFPropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'Коэффициент скидки или маркер акции.',
  example: 15,
  minimum: 0,
})

export const ProductsSaleCFRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'Коэффициент скидки или маркер акции.',
  example: 15,
})

export const ProductsSizesPropertyDocs = createPropertyDocsDecorator({
  description: 'Доступные размеры товара.',
  example: [40, 41, 42, 43],
  type: [Number],
  minItems: 1,
  uniqueItems: true,
})

export const ProductsMaterialPropertyDocs = createOptionalPropertyDocsDecorator(
  {
    description: 'Основной материал товара.',
    example: 'Mesh',
  },
)

export const ProductsMaterialRequiredPropertyDocs = createPropertyDocsDecorator(
  {
    description: 'Основной материал товара.',
    example: 'Mesh',
  },
)

export const ProductsIsHitPropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'Отмечает товар как хит каталога.',
  example: true,
})

export const ProductsIsHitRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'Отмечен ли товар как хит.',
  example: true,
})

export const ProductsIsNewArrivalPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Отмечает товар как новинку.',
    example: true,
  })

export const ProductsIsNewArrivalRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Отмечен ли товар как новинка.',
    example: true,
  })

export function ProductsColorsPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Доступные цвета товара.',
    type: [model],
    minItems: 1,
  })
}

export const ProductsCategoryIdPropertyDocs = createPropertyDocsDecorator({
  description: 'MongoDB ObjectId категории товара.',
  example: PRODUCT_CATEGORY_ID_EXAMPLE,
})

export const ProductsQuerySizePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Фильтр по размерам. Принимает повторяющиеся query-параметры или строку через запятую.',
    example: [40, 41],
    type: [Number],
  })

export const ProductsQueryPricePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Фильтр по цене. Одно значение — точная цена, два значения — диапазон от и до.',
    example: [120, 250],
    type: [Number],
    maxItems: 2,
  })

export const ProductsQueryColorNamePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Фильтр по названиям цветов. Принимает повторяющиеся query-параметры или строку через запятую.',
    example: ['Black', 'White'],
    type: [String],
  })

export const ProductsQueryCategoryPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Фильтр по id категорий. Принимает повторяющиеся query-параметры или строку через запятую.',
    example: [PRODUCT_CATEGORY_ID_EXAMPLE],
    type: [String],
  })

export const ProductsQueryMaterialPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Фильтр по материалу. Принимает повторяющиеся query-параметры или строку через запятую.',
    example: ['Mesh', 'Leather'],
    type: [String],
  })

export const ProductsQueryIsHitPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Фильтр по товарам, отмеченным как хиты.',
    example: true,
    type: Boolean,
  })

export const ProductsQueryIsNewArrivalPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Фильтр по товарам, отмеченным как новинки.',
    example: true,
    type: Boolean,
  })

export const ProductsQueryHasDiscountPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Фильтр по наличию или отсутствию скидки на товар.',
    example: true,
    type: Boolean,
  })

export const ProductsQuerySearchPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Полнотекстовый поиск по названию или описанию товара.',
    example: 'Air Max',
  })

export const ProductsQueryLimitPropertyDocs = QueryLimitPropertyDocs({
  example: DEFAULT_PRODUCTS_LIMIT,
  maximum: MAX_PRODUCTS_LIMIT,
})

export const ProductsQueryPagePropertyDocs = QueryPagePropertyDocs({
  example: 1,
})

export const ProductsQuerySortPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Стратегия сортировки списка товаров.',
    enum: PRODUCT_SORT_OPTIONS,
    enumName: 'ProductSortOptions',
    example: PRODUCT_SORT_OPTIONS.NEWEST,
  })

export const ProductsQueryIdsPropertyDocs = createOptionalPropertyDocsDecorator(
  {
    description:
      'Id конкретных товаров для загрузки. Принимает повторяющиеся query-параметры или строку через запятую.',
    example: [PRODUCT_ID_EXAMPLE, PRODUCT_CATEGORY_ID_EXAMPLE],
    type: [String],
  },
)

export const ProductsQueryExcludeIdsPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Id товаров, исключаемых из результата. Принимает повторяющиеся query-параметры или строку через запятую.',
    example: [PRODUCT_ID_EXAMPLE],
    type: [String],
  })

export const ProductsFilterSizesPropertyDocs = createPropertyDocsDecorator({
  description: 'Доступные размеры товаров для фильтров каталога.',
  example: [40, 41, 42, 43],
  type: [Number],
})

export const ProductsFilterMaterialsPropertyDocs = createPropertyDocsDecorator({
  description: 'Доступные материалы товаров для фильтров каталога.',
  example: ['Leather', 'Mesh', 'Textile'],
  type: [String],
})

export const ProductsFilterColorsPropertyDocs = createPropertyDocsDecorator({
  description: 'Доступные цвета товаров для фильтров каталога.',
  example: ['Black', 'White', 'Gray'],
  type: [String],
})

export function ProductsFilterCategoriesPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Доступные категории товаров для фильтров каталога.',
    type: [model],
  })
}

export const ProductsFilterPriceRangePropertyDocs = createPropertyDocsDecorator(
  {
    description: 'Минимальная и максимальная цена товаров в каталоге.',
    example: [132, 219],
    type: [Number],
    minItems: 2,
    maxItems: 2,
  },
)

export const ProductsResponseIdPropertyDocs = createPropertyDocsDecorator({
  description: 'Идентификатор товара.',
  example: PRODUCT_ID_EXAMPLE,
})

export const ProductsCategoryResponseIdPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Идентификатор категории.',
    example: PRODUCT_CATEGORY_ID_EXAMPLE,
  })

export const ProductsCategoryNamePropertyDocs = createPropertyDocsDecorator({
  description: 'Название категории.',
  example: 'Running',
})

export const ProductsCreatedAtPropertyDocs = createPropertyDocsDecorator({
  description: 'Время создания товара.',
  example: '2026-03-14T12:00:00.000Z',
})

export const ProductsUpdatedAtPropertyDocs = createPropertyDocsDecorator({
  description: 'Время последнего обновления товара.',
  example: '2026-03-14T12:15:00.000Z',
})

export const ProductsCategoryCreatedAtPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Время создания категории.',
    example: '2026-03-14T12:00:00.000Z',
  })

export const ProductsCategoryUpdatedAtPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Время последнего обновления категории.',
    example: '2026-03-14T12:00:00.000Z',
  })

export function ProductsResolvedCategoryPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Категория товара.',
    type: model,
  })
}

export function ProductsListItemsPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Товары, соответствующие текущим фильтрам.',
    type: [model],
  })
}

export const ProductsTotalPropertyDocs = createPropertyDocsDecorator({
  description: 'Общее количество товаров, соответствующих текущим фильтрам.',
  example: 24,
})

export class ProductsCategoryResponseDocs {
  @ProductsCategoryResponseIdPropertyDocs()
  _id!: string

  @ProductsCategoryNamePropertyDocs()
  name!: string

  @ProductsCategoryCreatedAtPropertyDocs()
  createdAt!: string

  @ProductsCategoryUpdatedAtPropertyDocs()
  updatedAt!: string
}

export class ProductsColorResponseDocs {
  @ProductsColorNamePropertyDocs()
  name!: string

  @ProductsColorHexPropertyDocs()
  hex!: string
}

export class ProductsFilterCategoryResponseDocs {
  @ProductsCategoryResponseIdPropertyDocs()
  _id!: string

  @ProductsCategoryNamePropertyDocs()
  name!: string
}

export class ProductsResponseDocs {
  @ProductsResponseIdPropertyDocs()
  _id!: string

  @ProductsTitlePropertyDocs()
  title!: string

  @ProductsPricePropertyDocs()
  price!: number

  @ProductsDescriptionPropertyDocs()
  description!: string

  @ProductsImagesPropertyDocs()
  images!: string[]

  @ProductsNullableOldPricePropertyDocs()
  oldPrice?: number | null

  @ProductsSaleCFRequiredPropertyDocs()
  saleCF!: number

  @ProductsSizesPropertyDocs()
  sizes!: number[]

  @ProductsMaterialRequiredPropertyDocs()
  material!: string

  @ProductsIsHitRequiredPropertyDocs()
  isHit!: boolean

  @ProductsIsNewArrivalRequiredPropertyDocs()
  isNewArrival!: boolean

  @ProductsColorsPropertyDocs(ProductsColorResponseDocs)
  colors!: ProductsColorResponseDocs[]

  @ProductsResolvedCategoryPropertyDocs(ProductsCategoryResponseDocs)
  category!: ProductsCategoryResponseDocs

  @ProductsCreatedAtPropertyDocs()
  createdAt!: string

  @ProductsUpdatedAtPropertyDocs()
  updatedAt!: string
}

export class ProductsListResponseDocs {
  @ProductsListItemsPropertyDocs(ProductsResponseDocs)
  products!: ProductsResponseDocs[]

  @ProductsTotalPropertyDocs()
  total!: number
}

export class ProductsFiltersMetadataResponseDocs {
  @ProductsFilterSizesPropertyDocs()
  sizes!: number[]

  @ProductsFilterMaterialsPropertyDocs()
  materials!: string[]

  @ProductsFilterColorsPropertyDocs()
  colors!: string[]

  @ProductsFilterCategoriesPropertyDocs(ProductsFilterCategoryResponseDocs)
  categories!: ProductsFilterCategoryResponseDocs[]

  @ProductsFilterPriceRangePropertyDocs()
  priceRange!: [number, number]
}

export function ProductsFindAllDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить список товаров',
      description:
        'Возвращает отфильтрованный список товаров с общим количеством. Поддерживает фильтры каталога и полнотекстовый поиск. Если переданы ids, порядок ответа сохраняет порядок из запроса. В этом случае page, limit и sort игнорируются, и возвращаются все найденные товары.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Список товаров успешно получен.',
      type: ProductsListResponseDocs,
    }),
    ApiInvalidQueryDocs(),
  )
}

export function ProductsFindFiltersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить метаданные фильтров товаров',
      description:
        'Возвращает значения фильтров и границы цен, используемые фильтрами каталога.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Метаданные фильтров товаров успешно получены.',
      type: ProductsFiltersMetadataResponseDocs,
    }),
  )
}

export function ProductsFindByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить товар по id',
      security: [],
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId товара.',
      example: PRODUCT_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Товар успешно получен.',
      type: ProductsResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Некорректный формат id товара.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Товар с указанным id не найден.',
      type: ErrorResponseDocs,
    }),
  )
}

export function ProductsCreateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Создать товар' }),
    ApiCreatedResponse({
      description: 'Товар успешно создан.',
      type: ProductsResponseDocs,
    }),
    ApiValidationErrorDocs(),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут создавать товары.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Категория товара не найдена.',
      type: ErrorResponseDocs,
    }),
  )
}

export function ProductsUpdateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Обновить товар' }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId товара.',
      example: PRODUCT_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Товар успешно обновлён.',
      type: ProductsResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Некорректный id товара или тело запроса.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут обновлять товары.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Товар или категория не найдены.',
      type: ErrorResponseDocs,
    }),
  )
}

export function ProductsDeleteDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Удалить товар' }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId товара.',
      example: PRODUCT_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Товар успешно удалён.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiBadRequestResponse({
      description: 'Некорректный формат id товара.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут удалять товары.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Товар с указанным id не найден.',
      type: ErrorResponseDocs,
    }),
  )
}
