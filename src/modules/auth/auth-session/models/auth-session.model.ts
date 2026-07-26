import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Schema as MongooseSchema } from 'mongoose'
import { User } from '@modules/user/models/user.model'

@Schema({
  collection: 'auth_sessions',
  timestamps: true,
})
export class AuthSession {
  _id!: string

  @Prop({ required: true, index: true })
  sessionId!: string

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: User.name,
    required: true,
    index: true,
  })
  userId!: string

  @Prop({ required: true, select: false })
  refreshTokenHash!: string

  @Prop({ required: true, index: true })
  expiresAt!: Date

  @Prop({ type: String, default: null })
  userAgent!: string | null

  @Prop({ type: String, default: null })
  ip!: string | null

  @Prop({ type: Date, default: null })
  lastUsedAt!: Date | null

  createdAt!: Date
  updatedAt!: Date
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession)

AuthSessionSchema.index({ userId: 1, sessionId: 1 }, { unique: true })
