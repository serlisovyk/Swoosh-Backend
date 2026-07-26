import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ timestamps: true })
export class ContactRequest {
  _id!: string

  @Prop({ required: true, trim: true, index: true })
  name!: string

  @Prop({ required: true, trim: true, lowercase: true, index: true })
  email!: string

  @Prop({ default: '', trim: true })
  message!: string
}

export const ContactRequestSchema = SchemaFactory.createForClass(ContactRequest)

ContactRequestSchema.index({ createdAt: -1 })
