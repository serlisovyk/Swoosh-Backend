import { IsNotEmpty, IsString } from 'class-validator'
import { AuthEmailVerificationTokenPropertyDocs } from '../../auth.swagger'
import {
  TOKEN_NOT_EMPTY_ERROR,
  TOKEN_STRING_ERROR,
} from '../../auth.constants'

export class VerifyEmailDto {
  @AuthEmailVerificationTokenPropertyDocs()
  @IsNotEmpty({ message: TOKEN_NOT_EMPTY_ERROR })
  @IsString({ message: TOKEN_STRING_ERROR })
  token!: string
}
