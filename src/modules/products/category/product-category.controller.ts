import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import { ParseObjectIdPipe } from '@nestjs/mongoose'
import { Auth } from '@modules/auth'
import { ROLES } from '@modules/users/users.types'
import { CreateProductCategoryDto } from './dto/create-product-category.dto'
import { FindAllProductCategoriesDto } from './dto/find-all-product-categories.dto'
import { UpdateProductCategoryDto } from './dto/update-product-category.dto'
import { ProductCategoryService } from './product-category.service'
import {
  ProductCategoryCreateDocs,
  ProductCategoryDeleteDocs,
  ProductCategoryFindAllDocs,
  ProductCategoryTagDocs,
  ProductCategoryUpdateDocs,
} from './product-category.swagger'

@ProductCategoryTagDocs()
@Controller('products/categories')
export class ProductCategoryController {
  constructor(private readonly categoryService: ProductCategoryService) {}

  @ProductCategoryFindAllDocs()
  @Auth(ROLES.ADMIN)
  @Get()
  findAll(@Query() dto: FindAllProductCategoriesDto) {
    return this.categoryService.findAll(dto)
  }

  @ProductCategoryCreateDocs()
  @HttpCode(HttpStatus.CREATED)
  @Auth(ROLES.ADMIN)
  @Post()
  create(@Body() dto: CreateProductCategoryDto) {
    return this.categoryService.create(dto)
  }

  @ProductCategoryUpdateDocs()
  @Auth(ROLES.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateProductCategoryDto,
  ) {
    return this.categoryService.update(id, dto)
  }

  @ProductCategoryDeleteDocs()
  @Auth(ROLES.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.categoryService.remove(id)
  }
}
