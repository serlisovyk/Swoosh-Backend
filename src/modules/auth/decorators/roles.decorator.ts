import { SetMetadata } from '@nestjs/common'
import { ROLES } from '@modules/users'
import { ROLES_METADATA_KEY } from '../auth.constants'

export const Roles = (...roles: ROLES[]) =>
  SetMetadata(ROLES_METADATA_KEY, roles)
