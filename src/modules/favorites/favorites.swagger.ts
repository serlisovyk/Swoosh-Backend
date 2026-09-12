import {
  ApiAuthRequiredDocs,
  ApiInvalidQueryDocs,
  ErrorResponseDocs,
} from '@common/errors'
import { applyDecorators } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from '@nestjs/swagger'
import {
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
  QueryLimitPropertyDocs,
  QueryPagePropertyDocs,
} from '@shared/swagger'
import {
  ProductsListItemsPropertyDocs,
  ProductsResponseDocs,
} from '@modules/products'
import {
  FAVORITES_DEFAULT_LIMIT,
  FAVORITES_MAX_LIMIT,
  FAVORITES_MAX_PRODUCT_IDS,
} from './favorites.constants'

export function FavoritesTagDocs() {
  return ApiTags('Favorites')
}

export const FavoritesProductIdsPropertyDocs = createPropertyDocsDecorator({
  description:
    'Id избранных товаров, которые нужно объединить с текущим состоянием аккаунта.',
  type: [String],
  example: ['65f1e8d3f9a2b56789c12345', '65f1e8d3f9a2b56789c12346'],
  uniqueItems: true,
  maxItems: FAVORITES_MAX_PRODUCT_IDS,
})

export const FavoritesOptionalProductIdsPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Id избранных товаров гостя, которые будут объединены с сохранённым избранным.',
    type: [String],
    example: ['65f1e8d3f9a2b56789c12345', '65f1e8d3f9a2b56789c12346'],
    uniqueItems: true,
    maxItems: FAVORITES_MAX_PRODUCT_IDS,
  })

export const FavoritesTotalPropertyDocs = createPropertyDocsDecorator({
  description: 'Общее количество избранных товаров пользователя.',
  example: 6,
})

export const FavoritesQueryPagePropertyDocs = QueryPagePropertyDocs({
  example: 1,
})

export const FavoritesQueryLimitPropertyDocs = QueryLimitPropertyDocs({
  example: FAVORITES_DEFAULT_LIMIT,
  maximum: FAVORITES_MAX_LIMIT,
})

export class FavoritesStateResponseDocs {
  @FavoritesProductIdsPropertyDocs()
  favoriteProductIds!: string[]

  @FavoritesTotalPropertyDocs()
  total!: number
}

export class FavoritesListResponseDocs {
  @ProductsListItemsPropertyDocs(ProductsResponseDocs)
  products!: ProductsResponseDocs[]

  @FavoritesTotalPropertyDocs()
  total!: number
}

export function FavoritesFindAllDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Получить избранные товары',
      description:
        'Возвращает избранное текущего пользователя в виде постраничного списка товаров.',
    }),
    ApiOkResponse({
      description: 'Избранные товары успешно получены.',
      type: FavoritesListResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiInvalidQueryDocs(),
    ApiNotFoundResponse({
      description: 'Пользователь не найден.',
      type: ErrorResponseDocs,
    }),
  )
}

export function FavoritesAddDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Добавить товар в избранное',
    }),
    ApiParam({
      name: 'productId',
      description:
        'MongoDB ObjectId товара, который нужно добавить в избранное.',
      example: '65f1e8d3f9a2b56789c12345',
    }),
    ApiOkResponse({
      description: 'Товар успешно добавлен в избранное.',
      type: FavoritesStateResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiBadRequestResponse({
      description:
        'Некорректный формат id товара либо достигнут лимит избранного.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Пользователь или товар не найден.',
      type: ErrorResponseDocs,
    }),
  )
}

export function FavoritesRemoveDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Удалить товар из избранного',
    }),
    ApiParam({
      name: 'productId',
      description:
        'MongoDB ObjectId товара, который нужно удалить из избранного.',
      example: '65f1e8d3f9a2b56789c12345',
    }),
    ApiOkResponse({
      description: 'Товар успешно удалён из избранного.',
      type: FavoritesStateResponseDocs,
    }),
    ApiAuthRequiredDocs(),
    ApiBadRequestResponse({
      description: 'Некорректный формат id товара.',
      type: ErrorResponseDocs,
    }),
    ApiNotFoundResponse({
      description: 'Пользователь не найден.',
      type: ErrorResponseDocs,
    }),
  )
}
