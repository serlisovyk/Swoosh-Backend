import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { AppEnv } from '@shared/config'
import { getEnv } from '@shared/utils'
import { UsersService } from '@modules/users'
import { JwtValidatePayload } from '../auth.types'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService<AppEnv, true>,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: getEnv(configService, 'jwt.JWT_SECRET'),
    })
  }

  async validate({ id }: JwtValidatePayload) {
    const user = await this.usersService.getById(id)
    if (!user) return null

    return user
  }
}
