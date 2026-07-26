import { IsNotEmpty, IsString, MinLength } from 'class-validator'
import {
  AuthNewPasswordPropertyDocs,
  AuthResetTokenPropertyDocs,
} from '../../auth.swagger'
import {
  TOKEN_NOT_EMPTY_ERROR,
  TOKEN_STRING_ERROR,
  PASSWORD_MIN_LENGTH_ERROR,
  PASSWORD_STRING_ERROR,
} from '../../auth.constants'

export class ResetPasswordDto {
  @AuthResetTokenPropertyDocs()
  @IsNotEmpty({ message: TOKEN_NOT_EMPTY_ERROR })
  @IsString({ message: TOKEN_STRING_ERROR })
  token!: string

  @AuthNewPasswordPropertyDocs()
  @IsString({ message: PASSWORD_STRING_ERROR })
  @MinLength(6, { message: PASSWORD_MIN_LENGTH_ERROR })
  newPassword!: string
}
