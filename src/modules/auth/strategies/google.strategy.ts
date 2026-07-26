import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { Profile, Strategy } from 'passport-google-oauth20'
import { AuthService } from '../auth.service'
import { SOCIAL_AUTH_PROVIDER } from '../auth.constants'

@Injectable()
export class GoogleStrategy extends PassportStrategy(
  Strategy,
  SOCIAL_AUTH_PROVIDER.GOOGLE,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.getOrThrow<string>('GOOGLE_CLIENT_ID'),
      clientSecret: configService.getOrThrow<string>('GOOGLE_CLIENT_SECRET'),
      callbackURL: `${configService.getOrThrow<string>('SERVER_URL')}/auth/google/callback`,
      scope: ['email', 'profile'],
    })
  }

  async validate(
    _accessToken: string,
    _refreshToken: string,
    profile: Profile,
  ) {
    const email = profile.emails?.[0]?.value

    if (!email) return null

    return this.authService.socialLogin({
      email,
      name: profile.displayName ?? '',
      provider: SOCIAL_AUTH_PROVIDER.GOOGLE,
      providerId: profile.id,
    })
  }
}
