import { Type } from 'class-transformer'
import { IsInt, IsPositive } from 'class-validator'

export class ThrottlerConfig {
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  THROTTLE_TTL!: number

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  THROTTLE_LIMIT!: number
}
