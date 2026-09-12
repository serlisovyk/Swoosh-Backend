import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ timestamps: true, collection: 'product_categories' })
export class ProductCategory {
  _id!: string

  @Prop({ required: true, unique: true, trim: true })
  name!: string
}

export const ProductCategorySchema =
  SchemaFactory.createForClass(ProductCategory)
