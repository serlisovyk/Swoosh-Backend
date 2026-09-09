import type { Request } from 'express'
import { User } from '@modules/user/models/user.model'
import { ROLES } from '@modules/user/user.types'

export interface JwtValidatePayload {
  id: string
}

export interface AccessTokenPayload {
  id: string
  role: ROLES
}

export interface RefreshTokenPayload {
  id: string
}

export type AuthFavoriteAwareUser = Pick<
  UserWithoutPassword,
  '_id' | 'favoriteProductIds'
>

export interface PreparedRequest extends Request {
  cookies: Record<string, string | undefined>
  user?: UserWithoutPassword
}

export type UserWithoutPassword = Omit<User, UserPasswordAndSensitiveFields>

type UserPasswordAndSensitiveFields =
  | 'password'
  | 'emailVerificationToken'
  | 'emailVerificationTokenExpiresAt'
  | 'resetPasswordToken'
  | 'resetPasswordTokenExpiresAt'
