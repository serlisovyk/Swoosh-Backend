import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooseSchema } from 'mongoose'
import { Product } from '@modules/products/models/product.model'
import { Address } from './user-address.model'
import { ROLES } from '../user.types'

@Schema({ timestamps: true })
export class User {
  _id!: string

  @Prop({ required: true, unique: true, index: true })
  email!: string

  @Prop({ required: true, select: false })
  password!: string

  @Prop({ type: String, default: null, unique: true, sparse: true, select: false })
  googleId?: string | null

  @Prop({ type: String, default: null, unique: true, sparse: true, select: false })
  githubId?: string | null

  @Prop({ type: String, default: null, select: false })
  resetPasswordToken?: string | null

  @Prop({ type: Date, default: null, select: false })
  resetPasswordTokenExpiresAt?: Date | null

  @Prop({ default: false })
  isEmailVerified!: boolean

  @Prop({ type: String, default: null, select: false })
  emailVerificationToken?: string | null

  @Prop({ type: Date, default: null, select: false })
  emailVerificationTokenExpiresAt?: Date | null

  @Prop({ default: '' })
  name?: string

  @Prop({ default: '' })
  phone?: string

  @Prop({
    type: String,
    enum: Object.values(ROLES),
    default: ROLES.USER,
    index: true,
  })
  role!: ROLES

  @Prop({
    type: [MongooseSchema.Types.ObjectId],
    ref: Product.name,
    default: [],
  })
  favoriteProductIds!: string[]

  @Prop({ type: Address, default: {} })
  address?: Address
}

export const UserSchema = SchemaFactory.createForClass(User)
