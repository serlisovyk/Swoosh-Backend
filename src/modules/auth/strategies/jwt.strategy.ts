import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AppEnv } from '@shared/config'
import { UserService } from '@modules/user/user.service'
import { JwtValidatePayload } from '../auth.types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService<AppEnv, true>,
    private readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET', { infer: true }),
    })
  }

  async validate({ id }: JwtValidatePayload) {
    const user = await this.userService.getById(id)
    if (!user) return null

    return user
  }
}
