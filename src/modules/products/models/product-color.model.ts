import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ _id: false, versionKey: false })
export class ProductColor {
  @Prop({ required: true, trim: true })
  name!: string

  @Prop({ required: true, trim: true })
  hex!: string
}

export const ProductColorSchema = SchemaFactory.createForClass(ProductColor)
