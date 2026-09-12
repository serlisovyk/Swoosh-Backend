import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES } from '@modules/users/users.types'
import { ROLES_METADATA_KEY } from '../auth.constants'
import { PreparedRequest } from '../auth.types'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<ROLES[]>(
      ROLES_METADATA_KEY,
      [context.getHandler(), context.getClass()],
    )

    if (!required?.length) return true

    const { user } = context.switchToHttp().getRequest<PreparedRequest>()

    if (!user?.role) return false

    if (user.role === ROLES.ADMIN) return true

    return required.includes(user.role)
  }
}
