import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'

@Schema({ timestamps: true })
export class NewsletterSubscription {
  _id!: string

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
    index: true,
  })
  email!: string
}

export const NewsletterSubscriptionSchema = SchemaFactory.createForClass(
  NewsletterSubscription,
)
