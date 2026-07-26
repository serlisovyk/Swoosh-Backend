import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'
import {
  FAVORITES_LIMIT_MAX_ERROR,
  FAVORITES_LIMIT_MIN_ERROR,
  FAVORITES_LIMIT_NUMBER_ERROR,
  FAVORITES_PAGE_MIN_ERROR,
  FAVORITES_PAGE_NUMBER_ERROR,
  FAVORITES_MAX_LIMIT,
} from '../favorites.constants'
import {
  FavoritesQueryLimitPropertyDocs,
  FavoritesQueryPagePropertyDocs,
} from '../favorites.swagger'

export class FindAllFavoritesDto {
  @FavoritesQueryPagePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: FAVORITES_PAGE_NUMBER_ERROR })
  @Min(1, { message: FAVORITES_PAGE_MIN_ERROR })
  page?: number

  @FavoritesQueryLimitPropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: FAVORITES_LIMIT_NUMBER_ERROR })
  @Min(1, { message: FAVORITES_LIMIT_MIN_ERROR })
  @Max(FAVORITES_MAX_LIMIT, { message: FAVORITES_LIMIT_MAX_ERROR })
  limit?: number
}
