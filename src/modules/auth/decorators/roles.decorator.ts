import { SetMetadata } from '@nestjs/common'
import { ROLES } from '@modules/user/user.types'

export const Roles = (...roles: ROLES[]) => SetMetadata('roles', roles)
