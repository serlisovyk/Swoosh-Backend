import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-github2'
import { AuthService } from '../auth.service'
import { SOCIAL_AUTH_PROVIDER } from '../auth.constants'

interface GithubEmailResponse {
  email: string
  primary: boolean
  verified: boolean
}

@Injectable()
export class GithubStrategy extends PassportStrategy(
  Strategy,
  SOCIAL_AUTH_PROVIDER.GITHUB,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GITHUB_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GITHUB_CLIENT_SECRET'),
      callbackURL: `${configService.getOrThrow<string>('SERVER_URL')}/auth/github/callback`,
      scope: ['user:email'],
    })
  }

  async validate(accessToken: string, _refreshToken: string, profile: Profile) {
    const email = await this.getVerifiedEmail(accessToken)

    if (!email) return null

    return this.authService.socialLogin({
      email,
      name: profile.displayName ?? profile.username ?? '',
      provider: SOCIAL_AUTH_PROVIDER.GITHUB,
      providerId: profile.id,
    })
  }

  private async getVerifiedEmail(accessToken: string) {
    const response = await fetch('https://api.github.com/user/emails', {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': this.configService.getOrThrow<string>('APP_NAME'),
      },
    }).catch(() => null)

    if (!response?.ok) return null

    const emails = (await response.json()) as GithubEmailResponse[]

    return (
      emails.find((email) => email.primary && email.verified)?.email ??
      emails.find((email) => email.verified)?.email ??
      null
    )
  }
}
