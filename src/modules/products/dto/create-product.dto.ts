import { Transform, Type } from 'class-transformer'
import {
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator'
import { trimStringValue, trimStringArrayValue } from '@shared/utils'
import { CreateProductColorDto } from './create-product-color.dto'
import {
  ProductsCategoryIdPropertyDocs,
  ProductsColorsPropertyDocs,
  ProductsDescriptionPropertyDocs,
  ProductsImagesPropertyDocs,
  ProductsIsHitPropertyDocs,
  ProductsIsNewArrivalPropertyDocs,
  ProductsMaterialPropertyDocs,
  ProductsOldPricePropertyDocs,
  ProductsPricePropertyDocs,
  ProductsSaleCFPropertyDocs,
  ProductsSizesPropertyDocs,
  ProductsTitlePropertyDocs,
} from '../products.swagger'

export class CreateProductDto {
  @ProductsTitlePropertyDocs()
  @Type(() => String)
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: 'Название товара должно быть строкой' })
  @IsNotEmpty({ message: 'Название товара не должно быть пустым' })
  title!: string

  @ProductsPricePropertyDocs()
  @Type(() => Number)
  @IsNumber({}, { message: 'Цена товара должна быть числом' })
  @Min(0, { message: 'Цена товара не может быть отрицательной' })
  price!: number

  @ProductsDescriptionPropertyDocs()
  @Type(() => String)
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: 'Описание товара должно быть строкой' })
  @IsNotEmpty({ message: 'Описание товара не должно быть пустым' })
  description!: string

  @ProductsImagesPropertyDocs()
  @Transform(({ value }) => trimStringArrayValue(value))
  @IsArray({ message: 'Изображения товара должны быть массивом' })
  @ArrayMinSize(1, {
    message: 'Нужно указать хотя бы одно изображение товара',
  })
  @IsString({
    each: true,
    message: 'Каждое изображение товара должно быть строкой',
  })
  @IsNotEmpty({
    each: true,
    message: 'Изображение товара не должно быть пустым',
  })
  @IsUrl(
    {},
    {
      each: true,
      message: 'Каждое изображение товара должно быть валидным URL',
    },
  )
  @ArrayUnique({ message: 'Изображения товара не должны повторяться' })
  images!: string[]

  @ProductsOldPricePropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Старая цена товара должна быть числом' })
  @Min(0, { message: 'Старая цена товара не может быть отрицательной' })
  oldPrice?: number

  @ProductsSaleCFPropertyDocs()
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Коэффициент скидки должен быть числом' })
  @Min(0, { message: 'Коэффициент скидки не может быть отрицательным' })
  saleCF?: number

  @ProductsSizesPropertyDocs()
  @IsArray({ message: 'Размеры товара должны быть массивом' })
  @ArrayMinSize(1, { message: 'Нужно указать хотя бы один размер товара' })
  @Type(() => Number)
  @IsNumber(
    {},
    { each: true, message: 'Каждый размер товара должен быть числом' },
  )
  @ArrayUnique({ message: 'Размеры товара не должны повторяться' })
  sizes!: number[]

  @ProductsMaterialPropertyDocs()
  @IsOptional()
  @Type(() => String)
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: 'Материал должен быть строкой' })
  @IsNotEmpty({ message: 'Материал не должен быть пустым' })
  material?: string

  @ProductsIsHitPropertyDocs()
  @IsOptional()
  @IsBoolean({ message: 'Поле isHit должно быть булевым значением' })
  isHit?: boolean

  @ProductsIsNewArrivalPropertyDocs()
  @IsOptional()
  @IsBoolean({ message: 'Поле isNewArrival должно быть булевым значением' })
  isNewArrival?: boolean

  @ProductsColorsPropertyDocs(CreateProductColorDto)
  @IsArray({ message: 'Цвета товара должны быть массивом' })
  @ArrayMinSize(1, { message: 'Нужно указать хотя бы один цвет товара' })
  @ValidateNested({ each: true })
  @Type(() => CreateProductColorDto)
  colors!: CreateProductColorDto[]

  @ProductsCategoryIdPropertyDocs()
  @Type(() => String)
  @Transform(({ value }) => trimStringValue(value))
  @IsMongoId({ message: 'Категория товара должна быть валидным id' })
  categoryId!: string
}
