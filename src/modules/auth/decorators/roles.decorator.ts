import { SetMetadata } from '@nestjs/common'
import { ROLES } from '@modules/users/users.types'

export const Roles = (...roles: ROLES[]) => SetMetadata('roles', roles)
