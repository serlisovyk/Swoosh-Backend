import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES } from '@modules/user/user.types'
import { PreparedRequest } from '../auth.types'

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<ROLES[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ])

    if (!required?.length) return true

    const { user } = context.switchToHttp().getRequest<PreparedRequest>()

    if (!user?.role) return false

    if (user.role === ROLES.ADMIN) return true

    return required.includes(user.role)
  }
}
