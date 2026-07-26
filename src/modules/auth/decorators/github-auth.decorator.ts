import { applyDecorators, UseGuards } from '@nestjs/common'
import { GithubAuthGuard } from '../guards/github-auth.guard'

export const GithubAuth = () => applyDecorators(UseGuards(GithubAuthGuard))
