import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { INDIVIDUAL_ORDER_STATUSES } from '../individual-order.types'

@Schema({ timestamps: true })
export class IndividualOrder {
  _id!: string

  @Prop({ required: true, trim: true, index: true })
  name!: string

  @Prop({ required: true, trim: true, index: true })
  phone!: string

  @Prop({ required: true, trim: true, lowercase: true, index: true })
  email!: string

  @Prop({ default: '', trim: true })
  message!: string

  @Prop({
    required: true,
    enum: Object.values(INDIVIDUAL_ORDER_STATUSES),
    default: INDIVIDUAL_ORDER_STATUSES.NEW,
    index: true,
  })
  status!: INDIVIDUAL_ORDER_STATUSES
}

export const IndividualOrderSchema =
  SchemaFactory.createForClass(IndividualOrder)

IndividualOrderSchema.index({ status: 1, createdAt: -1 })
