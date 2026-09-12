import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { SystemService } from './system.service'
import {
  SystemHealthDocs,
  SystemHelloDocs,
  SystemTagDocs,
} from './system.swagger'

@SystemTagDocs()
@Controller()
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @SystemHelloDocs()
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @Get()
  hello() {
    return this.systemService.hello()
  }

  @SystemHealthDocs()
  @SkipThrottle()
  @HttpCode(HttpStatus.OK)
  @Get('health')
  health() {
    return this.systemService.health()
  }
}
