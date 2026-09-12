import { Transform, Type } from 'class-transformer'
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator'
import { LIST_QUERY_MAX_LIMIT } from '@shared/constants'
import { ListQueryPagePropertyDocs } from '@shared/swagger'
import { trimStringValue } from '@shared/utils'

export class ListQueryDto {
  @IsOptional()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: 'Поисковая строка должна быть строкой' })
  search?: string

  @ListQueryPagePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Страница должна быть числом' })
  @Min(1, { message: 'Страница должна быть не меньше 1' })
  page?: number

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Лимит должен быть числом' })
  @Min(1, { message: 'Лимит должен быть не меньше 1' })
  @Max(LIST_QUERY_MAX_LIMIT, {
    message: 'Лимит должен быть не больше 100',
  })
  limit?: number
}
