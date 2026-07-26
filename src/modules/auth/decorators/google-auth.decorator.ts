import { applyDecorators, UseGuards } from '@nestjs/common'
import { GoogleAuthGuard } from '../guards/google-auth.guard'

export const GoogleAuth = () => applyDecorators(UseGuards(GoogleAuthGuard))
