import { Controller, Get, Req, Res } from '@nestjs/common'
import type { Response } from 'express'
import {
  AuthGithubCallbackDocs,
  AuthGithubLoginDocs,
  AuthGoogleCallbackDocs,
  AuthGoogleLoginDocs,
  AuthTagDocs,
} from '../auth.swagger'
import type { PreparedRequest } from '../auth.types'
import { GithubAuth } from '../decorators/github-auth.decorator'
import { GoogleAuth } from '../decorators/google-auth.decorator'
import { SocialAuthService } from './social-auth.service'

@AuthTagDocs()
@Controller('auth')
export class SocialAuthController {
  constructor(private readonly socialAuthService: SocialAuthService) {}

  @AuthGoogleLoginDocs()
  @GoogleAuth()
  @Get('google')
  googleLogin() {
    return
  }

  @AuthGoogleCallbackDocs()
  @GoogleAuth()
  @Get('google/callback')
  googleCallback(@Req() req: PreparedRequest, @Res() res: Response) {
    return this.socialAuthService.handleCallback(req.user, req, res)
  }

  @AuthGithubLoginDocs()
  @GithubAuth()
  @Get('github')
  githubLogin() {
    return
  }

  @AuthGithubCallbackDocs()
  @GithubAuth()
  @Get('github/callback')
  githubCallback(@Req() req: PreparedRequest, @Res() res: Response) {
    return this.socialAuthService.handleCallback(req.user, req, res)
  }
}
