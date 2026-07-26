import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UserWithoutPassword } from '../auth.types'
import { SOCIAL_AUTH_PROVIDER } from '../auth.constants'

@Injectable()
export class GoogleAuthGuard extends AuthGuard(SOCIAL_AUTH_PROVIDER.GOOGLE) {
  handleRequest<TUser = UserWithoutPassword>(err: unknown, user: TUser) {
    if (err instanceof Error) throw err
    if (err) throw new InternalServerErrorException('Авторизация не удалась')

    return (user ?? null) as TUser
  }
}
