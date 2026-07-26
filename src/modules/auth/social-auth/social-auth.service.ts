import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { Response } from 'express'
import { AuthService } from '../auth.service'
import { SOCIAL_AUTH_REDIRECT_URL, SOCIAL_AUTH_STATUS } from '../auth.constants'
import type { PreparedRequest, UserWithoutPassword } from '../auth.types'

@Injectable()
export class SocialAuthService {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  async handleCallback(
    user: UserWithoutPassword | undefined,
    request: PreparedRequest,
    response: Response,
  ) {
    this.authService.setAuthTokens(response, null, null)

    if (!user) {
      return response.redirect(this.getRedirectUrl(SOCIAL_AUTH_STATUS.ERROR))
    }

    const { accessToken, refreshToken } = await this.authService.createSession(
      user,
      request,
    )

    this.authService.setAuthTokens(response, accessToken, refreshToken)

    return response.redirect(this.getRedirectUrl(SOCIAL_AUTH_STATUS.SUCCESS))
  }

  private getRedirectUrl(
    status: (typeof SOCIAL_AUTH_STATUS)[keyof typeof SOCIAL_AUTH_STATUS],
  ) {
    const clientUrl = this.configService.getOrThrow<string>('CLIENT_URL')

    return `${clientUrl}${SOCIAL_AUTH_REDIRECT_URL}?status=${status}`
  }
}
