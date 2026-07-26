import { applyDecorators, UseGuards } from '@nestjs/common'
import { ROLES } from '@modules/user/user.types'
import { JwtAuthGuard } from '../guards/jwt.guard'
import { RolesGuard } from '../guards/roles.guard'
import { Roles } from './roles.decorator'

export const Auth = (...roles: ROLES[]) =>
  roles.length
    ? applyDecorators(Roles(...roles), UseGuards(JwtAuthGuard, RolesGuard))
    : applyDecorators(UseGuards(JwtAuthGuard, RolesGuard))
