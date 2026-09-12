import {
  ApiAuthRequiredDocs,
  ApiInvalidQueryDocs,
  ApiValidationErrorDocs,
  ErrorResponseDocs,
} from '@common/errors'
import { applyDecorators, Type } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
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
  createPropertyDocsDecorator,
  QueryLimitPropertyDocs,
  QueryPagePropertyDocs,
} from '@shared/swagger'
import { PRODUCT_CATEGORY_ID_EXAMPLE } from '../products.constants'
import { ProductsCategoryResponseDocs } from '../products.swagger'
import {
  PRODUCT_CATEGORY_DEFAULT_LIMIT,
  PRODUCT_CATEGORY_MAX_LIMIT,
} from './product-category.constants'

export function ProductCategoryTagDocs() {
  return ApiTags('Product Categories')
}

export const ProductCategoryNamePropertyDocs = createPropertyDocsDecorator({
  description: 'Название категории товаров.',
  example: 'Кроссовки',
})

export const ProductCategoryQueryPagePropertyDocs = QueryPagePropertyDocs({
  example: 1,
})

export const ProductCategoryQueryLimitPropertyDocs = QueryLimitPropertyDocs({
  example: PRODUCT_CATEGORY_DEFAULT_LIMIT,
  maximum: PRODUCT_CATEGORY_MAX_LIMIT,
})

export function ProductCategoryListItemsPropertyDocs(model: Type<unknown>) {
  return ApiProperty({
    description: 'Категории товаров, соответствующие текущей странице.',
    type: [model],
  })
}

export const ProductCategoryTotalPropertyDocs = createPropertyDocsDecorator({
  description: 'Общее количество категорий товаров.',
  example: 12,
})

export class ProductCategoryListResponseDocs {
  @ProductCategoryListItemsPropertyDocs(ProductsCategoryResponseDocs)
  categories!: ProductsCategoryResponseDocs[]

  @ProductCategoryTotalPropertyDocs()
  total!: number
}

export function ProductCategoryFindAllDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить список категорий',
      description:
        'Возвращает категории товаров, включая категории без товаров, отсортированные по названию, с пагинацией через page/limit.',
    }),
    ApiOkResponse({
      description: 'Список категорий получен успешно.',
      type: ProductCategoryListResponseDocs,
    }),
    ApiInvalidQueryDocs(),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут просматривать категории.',
      type: ErrorResponseDocs,
    }),
  )
}

export function ProductCategoryCreateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Создать категорию' }),
    ApiCreatedResponse({
      description: 'Категория успешно создана.',
      type: ProductsCategoryResponseDocs,
    }),
    ApiValidationErrorDocs(),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут создавать категории.',
      type: ErrorResponseDocs,
    }),
    ApiConflictResponse({
      description: 'Категория с таким названием уже существует.',
      type: ErrorResponseDocs,
    }),
  )
}

export function ProductCategoryUpdateDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Переименовать категорию' }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId категории.',
      example: PRODUCT_CATEGORY_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Категория успешно переименована.',
      type: ProductsCategoryResponseDocs,
    }),
    ApiBadRequestResponse({
      description: 'Id категории или тело запроса невалидны.',
      type: ErrorResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут переименовывать категории.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Категория с указанным id не найдена.',
      type: ErrorResponseDocs,
    }),
    ApiConflictResponse({
      description: 'Категория с таким названием уже существует.',
      type: ErrorResponseDocs,
    }),
  )
}

export function ProductCategoryDeleteDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Удалить категорию' }),
    ApiParam({
      name: 'id',
      description: 'MongoDB ObjectId категории.',
      example: PRODUCT_CATEGORY_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Категория успешно удалена.',
      schema: { type: 'boolean', example: true },
    }),
    ApiAuthRequiredDocs(),
    ApiForbiddenResponse({
      description: 'Только администраторы могут удалять категории.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Категория с указанным id не найдена.',
      type: ErrorResponseDocs,
    }),
    ApiConflictResponse({
      description: 'Категория используется в товарах и не может быть удалена.',
      type: ErrorResponseDocs,
    }),
  )
}
