import { Module } from '@nestjs/common'
import { MongooseModule } from '@nestjs/mongoose'
import {
  ProductCategory,
  ProductCategorySchema,
} from './models/product-category.model'
import { Product, ProductSchema } from './models/product.model'
import { ProductsController } from './products.controller'
import { ProductsService } from './products.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductCategory.name, schema: ProductCategorySchema },
    ]),
  ],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}
