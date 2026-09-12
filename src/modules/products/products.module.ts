import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  ProductCategory,
  ProductCategorySchema,
} from './category/models/product-category.model'
import { Product, ProductSchema } from './models/product.model'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'
import { ProductCategoryController } from './category/product-category.controller'
import { ProductCategoryService } from './category/product-category.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductCategory.name, schema: ProductCategorySchema },
    ]),
  ],
  controllers: [ProductsController, ProductCategoryController],
  providers: [ProductsService, ProductCategoryService],
  exports: [ProductsService],
})
export class ProductsModule {}
