import { Type } from 'class-transformer'
import { IsInt, IsOptional, Max, Min } from 'class-validator'
import { FAVORITES_MAX_LIMIT } from '../favorites.constants'
import {
  FavoritesQueryLimitPropertyDocs,
  FavoritesQueryPagePropertyDocs,
} from '../favorites.swagger'

export class FindAllFavoritesDto {
  @FavoritesQueryPagePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Страница должна быть числом.' })
  @Min(1, { message: 'Страница должна быть больше 0.' })
  page?: number

  @FavoritesQueryLimitPropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Лимит должен быть целым числом.' })
  @Min(1, { message: 'Лимит должен быть больше 0.' })
  @Max(FAVORITES_MAX_LIMIT, {
    message: `Лимит не должен быть больше ${FAVORITES_MAX_LIMIT}.`,
  })
  limit?: number
}
