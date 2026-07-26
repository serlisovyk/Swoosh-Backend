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
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
} from '@common/swagger'
import {
  PRODUCT_ID_EXAMPLE,
  PRODUCT_CATEGORY_ID_EXAMPLE,
  PRODUCT_IMAGE_EXAMPLES,
} from './products.constants'
import { PRODUCT_SORT_OPTIONS } from './products.types'

export function ProductsTagDocs() {
  return ApiTags('Products')
}

export const ProductsColorNamePropertyDocs = createPropertyDocsDecorator({
  description: 'Display name of the product color.',
  example: 'Graphite',
})

export const ProductsColorHexPropertyDocs = createPropertyDocsDecorator({
  description: 'HEX code of the product color.',
  example: '#2F3640',
})

export const ProductsTitlePropertyDocs = createPropertyDocsDecorator({
  description: 'Product title shown in the catalog.',
  example: 'Nike Air Max Pulse',
})

export const ProductsPricePropertyDocs = createPropertyDocsDecorator({
  description: 'Current product price.',
  example: 189.99,
  minimum: 0,
})

export const ProductsDescriptionPropertyDocs = createPropertyDocsDecorator({
  description: 'Detailed product description.',
  example: 'Breathable everyday sneakers with lightweight cushioning.',
})

export const ProductsImagesPropertyDocs = createPropertyDocsDecorator({
  description: 'List of product image URLs.',
  example: PRODUCT_IMAGE_EXAMPLES,
  type: [String],
  minItems: 1,
  uniqueItems: true,
})

export const ProductsOldPricePropertyDocs = createOptionalPropertyDocsDecorator(
  {
    description: 'Previous price before discount.',
    example: 229.99,
    minimum: 0,
  },
)

export const ProductsNullableOldPricePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Previous price before discount.',
    example: 229.99,
    nullable: true,
  })

export const ProductsSaleCFPropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'Discount coefficient or sale marker value.',
  example: 15,
  minimum: 0,
})

export const ProductsSaleCFRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'Discount coefficient or sale marker value.',
  example: 15,
})

export const ProductsSizesPropertyDocs = createPropertyDocsDecorator({
  description: 'Available product sizes.',
  example: [40, 41, 42, 43],
  type: [Number],
  minItems: 1,
  uniqueItems: true,
})

export const ProductsMaterialPropertyDocs = createOptionalPropertyDocsDecorator(
  {
    description: 'Primary material of the product.',
    example: 'Mesh',
  },
)

export const ProductsMaterialRequiredPropertyDocs = createPropertyDocsDecorator(
  {
    description: 'Primary material of the product.',
    example: 'Mesh',
  },
)

export const ProductsIsHitPropertyDocs = createOptionalPropertyDocsDecorator({
  description: 'Marks the product as a catalog hit.',
  example: true,
})

export const ProductsIsHitRequiredPropertyDocs = createPropertyDocsDecorator({
  description: 'Whether the product is marked as a hit.',
  example: true,
})

export const ProductsIsNewArrivalPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Marks the product as a new arrival.',
    example: true,
  })

export const ProductsIsNewArrivalRequiredPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Whether the product is marked as a new arrival.',
    example: true,
  })

export function ProductsColorsPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Available product colors.',
    type: [model],
    minItems: 1,
  })
}

export const ProductsCategoryIdPropertyDocs = createPropertyDocsDecorator({
  description: 'MongoDB ObjectId of the product category.',
  example: PRODUCT_CATEGORY_ID_EXAMPLE,
})

export const ProductsQuerySizePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Filter by sizes. Accepts repeated query params or a comma-separated string.',
    example: [40, 41],
    type: [Number],
  })

export const ProductsQueryPricePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Filter by price. One value means exact price, two values mean min and max range.',
    example: [120, 250],
    type: [Number],
    maxItems: 2,
  })

export const ProductsQueryColorNamePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Filter by color names. Accepts repeated query params or a comma-separated string.',
    example: ['Black', 'White'],
    type: [String],
  })

export const ProductsQueryCategoryPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Filter by category ids. Accepts repeated query params or a comma-separated string.',
    example: [PRODUCT_CATEGORY_ID_EXAMPLE],
    type: [String],
  })

export const ProductsQueryMaterialPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Filter by material. Accepts repeated query params or a comma-separated string.',
    example: ['Mesh', 'Leather'],
    type: [String],
  })

export const ProductsQueryIsHitPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Filter by products marked as hits.',
    example: true,
    type: Boolean,
  })

export const ProductsQueryIsNewArrivalPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Filter by products marked as new arrivals.',
    example: true,
    type: Boolean,
  })

export const ProductsQueryHasDiscountPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Filter by products with or without a discount.',
    example: true,
    type: Boolean,
  })

export const ProductsQuerySearchPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Free-text search by product title or description.',
    example: 'Air Max',
  })

export const ProductsQueryLimitPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Maximum number of products returned.',
    example: 18,
    minimum: 1,
    maximum: 100,
  })

export const ProductsQueryPagePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Results page number.',
    example: 1,
    minimum: 1,
  })

export const ProductsQuerySortPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Sorting strategy for the products list.',
    enum: PRODUCT_SORT_OPTIONS,
    enumName: 'ProductSortOptions',
    example: PRODUCT_SORT_OPTIONS.NEWEST,
  })

export const ProductsQueryIdsPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Specific product ids to load. Accepts repeated query params or a comma-separated string.',
    example: [PRODUCT_ID_EXAMPLE, PRODUCT_CATEGORY_ID_EXAMPLE],
    type: [String],
  })

export const ProductsQueryExcludeIdsPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Product ids to exclude from the result. Accepts repeated query params or a comma-separated string.',
    example: [PRODUCT_ID_EXAMPLE],
    type: [String],
  })

export const ProductsFilterSizesPropertyDocs = createPropertyDocsDecorator({
  description: 'Available product sizes for the catalog filters.',
  example: [40, 41, 42, 43],
  type: [Number],
})

export const ProductsFilterMaterialsPropertyDocs = createPropertyDocsDecorator({
  description: 'Available product materials for the catalog filters.',
  example: ['Leather', 'Mesh', 'Textile'],
  type: [String],
})

export const ProductsFilterColorsPropertyDocs = createPropertyDocsDecorator({
  description: 'Available product colors for the catalog filters.',
  example: ['Black', 'White', 'Gray'],
  type: [String],
})

export function ProductsFilterCategoriesPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Available product categories for the catalog filters.',
    type: [model],
  })
}

export const ProductsFilterPriceRangePropertyDocs = createPropertyDocsDecorator(
  {
    description: 'Min and max product prices available in the catalog.',
    example: [132, 219],
    type: [Number],
    minItems: 2,
    maxItems: 2,
  },
)

export const ProductsResponseIdPropertyDocs = createPropertyDocsDecorator({
  description: 'Product identifier.',
  example: PRODUCT_ID_EXAMPLE,
})

export const ProductsCategoryResponseIdPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Category identifier.',
    example: PRODUCT_CATEGORY_ID_EXAMPLE,
  })

export const ProductsCategoryNamePropertyDocs = createPropertyDocsDecorator({
  description: 'Category name.',
  example: 'Running',
})

export const ProductsCreatedAtPropertyDocs = createPropertyDocsDecorator({
  description: 'Product creation timestamp.',
  example: '2026-03-14T12:00:00.000Z',
})

export const ProductsUpdatedAtPropertyDocs = createPropertyDocsDecorator({
  description: 'Product update timestamp.',
  example: '2026-03-14T12:15:00.000Z',
})

export const ProductsCategoryCreatedAtPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Category creation timestamp.',
    example: '2026-03-14T12:00:00.000Z',
  })

export const ProductsCategoryUpdatedAtPropertyDocs =
  createPropertyDocsDecorator({
    description: 'Category update timestamp.',
    example: '2026-03-14T12:00:00.000Z',
  })

export function ProductsResolvedCategoryPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Resolved product category.',
    type: model,
  })
}

export function ProductsListItemsPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Products matching the current filters.',
    type: [model],
  })
}

export const ProductsTotalPropertyDocs = createPropertyDocsDecorator({
  description: 'Total number of products matching the current filters.',
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
      summary: 'Get products list',
      description:
        'Returns a filtered list of products with the total count. Supports catalog filters and free-text search. When ids are provided, the response preserves the same order as in the query.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Products list returned successfully.',
      type: ProductsListResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'One or more query parameters are invalid.',
    }),
  )
}

export function ProductsFindFiltersDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get products filters metadata',
      description:
        'Returns filter values and price bounds used by the catalog filters.',
      security: [],
    }),
    ApiOkResponse({
      description: 'Product filters metadata returned successfully.',
      type: ProductsFiltersMetadataResponseDocs,
    }),
  )
}

export function ProductsFindByIdDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get product by id',
      security: [],
    }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the product.',
      example: PRODUCT_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Product returned successfully.',
      type: ProductsResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Product id has an invalid format.',
    }),
    ApiNotFoundResponse({
      description: 'Product with the provided id was not found.',
    }),
  )
}

export function ProductsCreateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Create product' }),
    ApiCreatedResponse({
      description: 'Product created successfully.',
      type: ProductsResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Request body validation failed.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiForbiddenResponse({
      description: 'Only admins can create products.',
    }),
    ApiNotFoundResponse({
      description: 'Product category was not found.',
    }),
  )
}

export function ProductsUpdateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update product' }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the product.',
      example: PRODUCT_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Product updated successfully.',
      type: ProductsResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Product id or request body is invalid.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiForbiddenResponse({
      description: 'Only admins can update products.',
    }),
    ApiNotFoundResponse({
      description: 'Product or category was not found.',
    }),
  )
}

export function ProductsDeleteDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Delete product' }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId of the product.',
      example: PRODUCT_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Product deleted successfully.',
      schema: {
        type: 'boolean',
        example: true,
      },
    }),
    ApiBadRequestResponse({
      description: 'Product id has an invalid format.',
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiForbiddenResponse({
      description: 'Only admins can delete products.',
    }),
    ApiNotFoundResponse({
      description: 'Product with the provided id was not found.',
    }),
  )
}
