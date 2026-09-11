import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { SystemHealthResponse, SystemHelloResponse } from './system.types'

@Injectable()
export class SystemService {
  constructor(private readonly configService: ConfigService) {}

  hello(): SystemHelloResponse {
    const appName = this.configService.getOrThrow<string>('APP_NAME')

    return { message: `${appName} API` }
  }

  health(): SystemHealthResponse {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }
}
