import { ErrorResponseDocs } from '@common/errors'
import { applyDecorators } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import {
  ApiAuthRequiredDocs,
  ApiValidationErrorDocs,
  createPropertyDocsDecorator,
} from '@common/swagger'
import { PRODUCT_CATEGORY_ID_EXAMPLE } from '../products.constants'
import { ProductsCategoryResponseDocs } from '../products.swagger'

export function ProductCategoryTagDocs() {
  return ApiTags('Product Categories')
}

export const ProductCategoryNamePropertyDocs = createPropertyDocsDecorator({
  description: 'Название категории товаров.',
  example: 'Кроссовки',
})

export function ProductCategoryFindAllDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить список категорий',
      description:
        'Возвращает все категории товаров, включая категории без товаров, отсортированные по названию.',
    }),
    ApiOkResponse({
      description: 'Список категорий получен успешно.',
      type: [ProductsCategoryResponseDocs],
    }),
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
