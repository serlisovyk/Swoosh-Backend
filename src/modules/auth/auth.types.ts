import type { Request } from 'express'
import { User } from '@modules/user/models/user.model'
import { ROLES } from '@modules/user/user.types'
import { SOCIAL_AUTH_PROVIDER } from './auth.constants'

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

export type AuthSocialProvider =
  (typeof SOCIAL_AUTH_PROVIDER)[keyof typeof SOCIAL_AUTH_PROVIDER]

export interface AuthSocialProfile {
  email: string
  name: string
  provider: AuthSocialProvider
  providerId: string
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
  | 'googleId'
  | 'githubId'
  | 'emailVerificationToken'
  | 'emailVerificationTokenExpiresAt'
  | 'resetPasswordToken'
  | 'resetPasswordTokenExpiresAt'
