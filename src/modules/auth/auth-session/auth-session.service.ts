import { Injectable } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { hash, verify } from 'argon2'
import { AuthSession } from './models/auth-session.model'
import type {
  ActiveAuthSession,
  AuthSessionModel,
  CreateAuthSessionData,
  RotateAuthSessionData,
  StoredAuthSession,
} from '../auth.types'

@Injectable()
export class AuthSessionService {
  constructor(
    @InjectModel(AuthSession.name)
    private readonly authSessionModel: AuthSessionModel,
  ) {}

  async create(data: CreateAuthSessionData) {
    await this.authSessionModel.create({
      sessionId: data.sessionId,
      userId: data.userId,
      refreshTokenHash: await hash(data.refreshToken),
      expiresAt: data.expiresAt,
      userAgent: data.userAgent,
      ip: data.ip,
      lastUsedAt: new Date(),
    })
  }

  findByUserIdAndSessionId(userId: string, sessionId: string) {
    return this.authSessionModel
      .findOne({ userId, sessionId })
      .select('+refreshTokenHash')
      .lean<StoredAuthSession | null>()
  }

  async matchesRefreshToken(
    authSession: StoredAuthSession,
    refreshToken: string,
  ) {
    return verify(authSession.refreshTokenHash, refreshToken).catch(() => false)
  }

  async rotateIfRefreshTokenHashMatches(data: RotateAuthSessionData) {
    const updatedSession = await this.authSessionModel.findOneAndUpdate(
      {
        userId: data.userId,
        sessionId: data.sessionId,
        refreshTokenHash: data.currentRefreshTokenHash,
      },
      {
        refreshTokenHash: await hash(data.refreshToken),
        expiresAt: data.expiresAt,
        userAgent: data.userAgent,
        ip: data.ip,
        lastUsedAt: new Date(),
      },
      {
        returnDocument: 'after',
        runValidators: true,
      },
    )

    return Boolean(updatedSession)
  }

  async findActiveByUserId(userId: string) {
    await this.deleteExpiredByUserId(userId)

    return this.authSessionModel
      .find({
        userId,
        expiresAt: { $gt: new Date() },
      })
      .sort({ lastUsedAt: -1, createdAt: -1 })
      .lean<ActiveAuthSession[]>()
  }

  deleteByUserIdAndSessionId(userId: string, sessionId: string) {
    return this.authSessionModel.deleteOne({ userId, sessionId })
  }

  deleteExpiredByUserId(userId: string) {
    return this.authSessionModel.deleteMany({
      userId,
      expiresAt: { $lte: new Date() },
    })
  }

  deleteAllByUserId(userId: string) {
    return this.authSessionModel.deleteMany({ userId })
  }
}
