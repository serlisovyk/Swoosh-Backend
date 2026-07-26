import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooseSchema } from 'mongoose'
import { ProductCategory } from './product-category.model'
import { ProductColor, ProductColorSchema } from './product-color.model'

@Schema({ timestamps: true })
export class Product {
  _id!: string

  @Prop({ required: true, trim: true, index: true })
  title!: string

  @Prop({ required: true, min: 0 })
  price!: number

  @Prop({ required: true, trim: true })
  description!: string

  @Prop({ type: [String], default: [] })
  images!: string[]

  @Prop({ type: Number, default: null, min: 0 })
  oldPrice?: number | null

  @Prop({ type: Number, default: 0, min: 0 })
  saleCF!: number

  @Prop({ type: [Number], default: [] })
  sizes!: number[]

  @Prop({ default: '', trim: true })
  material!: string

  @Prop({ default: false })
  isHit!: boolean

  @Prop({ default: false })
  isNewArrival!: boolean

  @Prop({ type: [ProductColorSchema], default: [] })
  colors!: ProductColor[]

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: ProductCategory.name,
    required: true,
    index: true,
  })
  category!: string
}

export const ProductSchema = SchemaFactory.createForClass(Product)
