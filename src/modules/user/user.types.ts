import { Model } from 'mongoose'
import { User } from './models/user.model'

export const ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN',
} as const

export type ROLES = (typeof ROLES)[keyof typeof ROLES]

export type UserModel = Model<User>
