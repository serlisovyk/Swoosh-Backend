import { IsNotEmpty, IsString, MinLength } from 'class-validator'
import {
  AuthNewPasswordPropertyDocs,
  AuthResetTokenPropertyDocs,
} from '../password-reset.swagger'
import {
  PASSWORD_MIN_LENGTH_ERROR,
  PASSWORD_STRING_ERROR,
} from '../../auth.constants'

export class ResetPasswordDto {
  @AuthResetTokenPropertyDocs()
  @IsNotEmpty({ message: 'Токен не должен быть пустым' })
  @IsString({ message: 'Токен должен быть строкой' })
  token!: string

  @AuthNewPasswordPropertyDocs()
  @IsString({ message: PASSWORD_STRING_ERROR })
  @MinLength(6, { message: PASSWORD_MIN_LENGTH_ERROR })
  newPassword!: string
}
