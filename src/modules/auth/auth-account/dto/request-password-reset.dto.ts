import { Transform } from 'class-transformer'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'
import { normalizeEmailValue } from '@shared/utils'
import { AuthEmailPropertyDocs } from '../../auth.swagger'
import { EMAIL_VALIDATION_ERROR } from '../../auth.constants'

export class RequestPasswordResetDto {
  @AuthEmailPropertyDocs()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsNotEmpty({ message: EMAIL_VALIDATION_ERROR })
  @IsString({ message: EMAIL_VALIDATION_ERROR })
  @IsEmail({}, { message: EMAIL_VALIDATION_ERROR })
  email!: string
}
