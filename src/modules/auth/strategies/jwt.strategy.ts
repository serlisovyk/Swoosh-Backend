import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { UserService } from '@modules/user/user.service'
import { extractAccessTokenFromCookie } from '../auth.utils'
import { JwtValidatePayload } from '../auth.types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([extractAccessTokenFromCookie]),
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    })
  }

  async validate({ id }: JwtValidatePayload) {
    const user = await this.userService.getById(id)
    if (!user) return null

    return user
  }
}
