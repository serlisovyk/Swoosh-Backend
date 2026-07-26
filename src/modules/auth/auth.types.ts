import type { Request } from 'express'
import type { Model } from 'mongoose'
import { User } from '@modules/user/models/user.model'
import { ROLES } from '@modules/user/user.types'
import { SOCIAL_AUTH_PROVIDER } from './auth.constants'
import { AuthSession } from './auth-session/models/auth-session.model'

export interface JwtValidatePayload {
  id: string
}

export interface AccessTokenPayload {
  id: string
  role: ROLES
}

export interface RefreshTokenPayload {
  id: string
  jti: string
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

export interface AuthSessionMetadata {
  userAgent: string | null
  ip: string | null
}

export interface CreateAuthSessionData extends AuthSessionMetadata {
  userId: string
  sessionId: string
  refreshToken: string
  expiresAt: Date
}

export interface RotateAuthSessionData extends CreateAuthSessionData {
  currentRefreshTokenHash: string
}

export interface AuthSessionItem {
  sessionId: string
  deviceLabel: string
  ip: string | null
  lastUsedAt: Date
  createdAt: Date
  isCurrent: boolean
}

export interface AuthSessionsResponse {
  sessions: AuthSessionItem[]
}

export interface PreparedRequest extends Request {
  cookies: Record<string, string | undefined>
  user?: UserWithoutPassword
}

export type AuthSessionModel = Model<AuthSession>

export type StoredAuthSession = Pick<
  AuthSession,
  'userId' | 'sessionId' | 'refreshTokenHash' | 'expiresAt' | 'userAgent' | 'ip' | 'lastUsedAt'
>

export type ActiveAuthSession = Pick<
  AuthSession,
  'userId' | 'sessionId' | 'expiresAt' | 'userAgent' | 'ip' | 'lastUsedAt' | 'createdAt'
>

export type UserWithoutPassword = Omit<User, UserPasswordAndSensitiveFields>

type UserPasswordAndSensitiveFields =
  | 'password'
  | 'googleId'
  | 'githubId'
  | 'emailVerificationToken'
  | 'emailVerificationTokenExpiresAt'
  | 'resetPasswordToken'
  | 'resetPasswordTokenExpiresAt'
