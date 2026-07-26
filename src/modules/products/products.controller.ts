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
import { Auth } from '@modules/auth/decorators/auth.decorator'
import { ROLES } from '@modules/user/user.types'
import { CreateProductDto } from './dto/create-product.dto'
import { FindAllProductsDto } from './dto/find-all-products.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductsService } from './products.service'
import {
  ProductsCreateDocs,
  ProductsDeleteDocs,
  ProductsFindAllDocs,
  ProductsFindFiltersDocs,
  ProductsFindByIdDocs,
  ProductsTagDocs,
  ProductsUpdateDocs,
} from './products.swagger'

@ProductsTagDocs()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @ProductsFindAllDocs()
  @Get()
  findAll(@Query() dto: FindAllProductsDto) {
    return this.productsService.findAll(dto)
  }

  @ProductsFindFiltersDocs()
  @Get('filters')
  findFilters() {
    return this.productsService.findFiltersMetadata()
  }

  @ProductsFindByIdDocs()
  @Get(':id')
  findById(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productsService.findById(id)
  }

  @ProductsCreateDocs()
  @HttpCode(HttpStatus.CREATED)
  @Auth(ROLES.ADMIN)
  @Post()
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto)
  }

  @ProductsUpdateDocs()
  @Auth(ROLES.ADMIN)
  @Put(':id')
  update(
    @Param('id', ParseObjectIdPipe) id: string,
    @Body() dto: UpdateProductDto,
  ) {
    return this.productsService.update(id, dto)
  }

  @ProductsDeleteDocs()
  @Auth(ROLES.ADMIN)
  @Delete(':id')
  remove(@Param('id', ParseObjectIdPipe) id: string) {
    return this.productsService.remove(id)
  }
}
