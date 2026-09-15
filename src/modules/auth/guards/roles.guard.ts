import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES } from '@modules/users/users.types'
import { ACCESS_DENIED_ERROR, ROLES_METADATA_KEY } from '../auth.constants'
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

    if (
      !user?.role ||
      (user.role !== ROLES.ADMIN && !required.includes(user.role))
    ) {
      throw new ForbiddenException(ACCESS_DENIED_ERROR)
    }

    return true
  }
}
