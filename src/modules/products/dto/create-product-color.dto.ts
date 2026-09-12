import { Transform } from 'class-transformer'
import { IsHexColor, IsNotEmpty, IsString } from 'class-validator'
import { trimStringValue } from '@shared/utils'
import {
  ProductsColorHexPropertyDocs,
  ProductsColorNamePropertyDocs,
} from '../products.swagger'

export class CreateProductColorDto {
  @ProductsColorNamePropertyDocs()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: 'Название цвета должно быть строкой' })
  @IsNotEmpty({ message: 'Название цвета не должно быть пустым' })
  name!: string

  @ProductsColorHexPropertyDocs()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: 'HEX цвета должен быть строкой' })
  @IsNotEmpty({ message: 'HEX цвета не должен быть пустым' })
  @IsHexColor({ message: 'HEX цвета должен быть валидным значением' })
  hex!: string
}
