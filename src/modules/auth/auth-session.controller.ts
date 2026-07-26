import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Req,
  Res,
} from '@nestjs/common'
import type { Response } from 'express'
import { Auth } from './decorators/auth.decorator'
import { CurrentUser } from './decorators/user.decorator'
import { AuthService } from './auth.service'
import {
  AuthLogoutAllDocs,
  AuthRevokeSessionDocs,
  AuthSessionsDocs,
  AuthTagDocs,
} from './auth.swagger'
import { REFRESH_TOKEN_COOKIE_NAME } from './auth.constants'
import type { PreparedRequest, UserWithoutPassword } from './auth.types'

@AuthTagDocs()
@Controller('auth')
export class AuthSessionController {
  constructor(private readonly authService: AuthService) {}

  @AuthSessionsDocs()
  @Auth()
  @Get('sessions')
  getSessions(
    @CurrentUser() user: UserWithoutPassword,
    @Req() req: PreparedRequest,
  ) {
    return this.authService.getSessions(
      String(user._id),
      req.cookies?.[REFRESH_TOKEN_COOKIE_NAME],
    )
  }

  @AuthRevokeSessionDocs()
  @HttpCode(HttpStatus.OK)
  @Auth()
  @Delete('sessions/:sessionId')
  revokeSession(
    @CurrentUser() user: UserWithoutPassword,
    @Req() req: PreparedRequest,
    @Param('sessionId') sessionId: string,
  ) {
    return this.authService.revokeSession(
      String(user._id),
      sessionId,
      req.cookies?.[REFRESH_TOKEN_COOKIE_NAME],
    )
  }

  @AuthLogoutAllDocs()
  @HttpCode(HttpStatus.OK)
  @Auth()
  @Post('logout-all')
  async logoutAll(
    @CurrentUser() user: UserWithoutPassword,
    @Res({ passthrough: true }) res: Response,
  ) {
    await this.authService.logoutAll(String(user._id))

    this.authService.setAuthTokens(res, null, null)

    return true
  }
}
