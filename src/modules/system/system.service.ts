import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { AppEnv } from '@shared/config'
import { getEnv } from '@shared/utils'
import type { SystemHealthResponse, SystemHelloResponse } from './system.types'

@Injectable()
export class SystemService {
  constructor(private readonly configService: ConfigService<AppEnv, true>) {}

  hello(): SystemHelloResponse {
    const appName = getEnv(this.configService, 'app.APP_NAME')

    return { message: `${appName} API` }
  }

  health(): SystemHealthResponse {
    return { status: 'ok', timestamp: new Date().toISOString() }
  }
}
