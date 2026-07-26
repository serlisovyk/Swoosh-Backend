import { Injectable, InternalServerErrorException } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { UserWithoutPassword } from '../auth.types'
import { SOCIAL_AUTH_PROVIDER } from '../auth.constants'

@Injectable()
export class GithubAuthGuard extends AuthGuard(SOCIAL_AUTH_PROVIDER.GITHUB) {
  handleRequest<TUser = UserWithoutPassword>(err: unknown, user: TUser) {
    if (err instanceof Error) throw err
    if (err) throw new InternalServerErrorException('Авторизация не удалась')

    return (user ?? null) as TUser
  }
}
