import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsMongoId,
  IsOptional,
} from 'class-validator'
import {
  FAVORITES_PRODUCT_IDS_ARRAY_ERROR,
  FAVORITES_PRODUCT_ID_FORMAT_ERROR,
  FAVORITES_PRODUCT_IDS_MAX_SIZE_ERROR,
  FAVORITES_MAX_PRODUCT_IDS,
  FavoritesOptionalProductIdsPropertyDocs,
} from '@modules/favorites'

export class FavoriteProductIdsDto {
  @FavoritesOptionalProductIdsPropertyDocs()
  @IsOptional()
  @IsArray({ message: FAVORITES_PRODUCT_IDS_ARRAY_ERROR })
  @IsMongoId({ each: true, message: FAVORITES_PRODUCT_ID_FORMAT_ERROR })
  @ArrayMaxSize(FAVORITES_MAX_PRODUCT_IDS, {
    message: FAVORITES_PRODUCT_IDS_MAX_SIZE_ERROR,
  })
  @ArrayUnique()
  favoriteProductIds?: string[]
}
