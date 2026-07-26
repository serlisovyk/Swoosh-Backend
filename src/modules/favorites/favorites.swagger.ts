import { applyDecorators } from '@nestjs/common'
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger'
import {
  createOptionalPropertyDocsDecorator,
  createPropertyDocsDecorator,
} from '@common/swagger'
import { ProductsListItemsPropertyDocs, ProductsResponseDocs } from '@modules/products/products.swagger'
import {
  FAVORITES_DEFAULT_LIMIT,
  FAVORITES_MAX_PRODUCT_IDS,
  FAVORITES_PRODUCT_ID_EXAMPLE,
  FAVORITES_PRODUCT_IDS_EXAMPLE,
} from './favorites.constants'

export function FavoritesTagDocs() {
  return ApiTags('Favorites')
}

export const FavoritesProductIdsPropertyDocs = createPropertyDocsDecorator({
  description: 'Favorite product ids that should be merged into the account state.',
  type: [String],
  example: FAVORITES_PRODUCT_IDS_EXAMPLE,
  uniqueItems: true,
  maxItems: FAVORITES_MAX_PRODUCT_IDS,
})

export const FavoritesOptionalProductIdsPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description:
      'Guest favorite product ids that will be merged with stored favorites.',
    type: [String],
    example: FAVORITES_PRODUCT_IDS_EXAMPLE,
    uniqueItems: true,
    maxItems: FAVORITES_MAX_PRODUCT_IDS,
  })

export const FavoritesTotalPropertyDocs = createPropertyDocsDecorator({
  description: 'Total number of favorite products stored for the user.',
  example: 6,
})

export const FavoritesQueryPagePropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Page number for favorites pagination.',
    example: 1,
    minimum: 1,
  })

export const FavoritesQueryLimitPropertyDocs =
  createOptionalPropertyDocsDecorator({
    description: 'Maximum number of favorite products returned in one page.',
    example: FAVORITES_DEFAULT_LIMIT,
    minimum: 1,
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
      summary: 'Get favorite products',
      description:
        'Returns the current user favorites as a paginated product list.',
    }),
    ApiOkResponse({
      description: 'Favorite products returned successfully.',
      type: FavoritesListResponseDocs,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiBadRequestResponse({
      description: 'One or more query parameters are invalid.',
    }),
    ApiNotFoundResponse({
      description: 'User was not found.',
    }),
  )
}

export function FavoritesAddDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Add product to favorites',
    }),
    ApiParam({
      name: 'productId',
      description: 'MongoDB ObjectId of the product to add to favorites.',
      example: FAVORITES_PRODUCT_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Product added to favorites successfully.',
      type: FavoritesStateResponseDocs,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiBadRequestResponse({
      description: 'Product id has an invalid format or favorites limit was reached.',
    }),
    ApiNotFoundResponse({
      description: 'User or product was not found.',
    }),
  )
}

export function FavoritesRemoveDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Remove product from favorites',
    }),
    ApiParam({
      name: 'productId',
      description: 'MongoDB ObjectId of the product to remove from favorites.',
      example: FAVORITES_PRODUCT_ID_EXAMPLE,
    }),
    ApiOkResponse({
      description: 'Product removed from favorites successfully.',
      type: FavoritesStateResponseDocs,
    }),
    ApiUnauthorizedResponse({
      description: 'Authentication is required.',
    }),
    ApiBadRequestResponse({
      description: 'Product id has an invalid format.',
    }),
    ApiNotFoundResponse({
      description: 'User was not found.',
    }),
  )
}
