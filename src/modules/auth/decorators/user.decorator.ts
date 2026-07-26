import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { UserWithoutPassword, PreparedRequest } from '../auth.types'

export const CurrentUser = createParamDecorator(
  (data: keyof UserWithoutPassword, context: ExecutionContext) => {
    const user = context.switchToHttp().getRequest<PreparedRequest>().user
    if (!user) return null

    return data ? user[data] : user
  },
)
