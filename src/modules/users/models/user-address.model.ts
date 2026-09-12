import { Schema, Prop } from '@nestjs/mongoose'

@Schema({ timestamps: true })
export class Address {
  @Prop({ default: '' })
  company?: string

  @Prop({ default: '' })
  region?: string

  @Prop({ default: '' })
  city?: string

  @Prop({ default: '' })
  street?: string

  @Prop({ default: '' })
  zip?: string

  @Prop({ default: '' })
  buildingNumber?: string
}
