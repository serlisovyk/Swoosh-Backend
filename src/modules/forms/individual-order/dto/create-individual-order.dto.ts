import { Transform } from 'class-transformer'
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator'
import {
  normalizeEmailValue,
  normalizePhoneValue,
  trimStringValue,
} from '@shared/utils'
import {
  IndividualOrderEmailPropertyDocs,
  IndividualOrderMessagePropertyDocs,
  IndividualOrderNamePropertyDocs,
  IndividualOrderPhonePropertyDocs,
} from '../individual-order.swagger'

export class CreateIndividualOrderDto {
  @IndividualOrderNamePropertyDocs()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: 'Имя должно быть строкой' })
  @IsNotEmpty({ message: 'Имя обязательно' })
  @MaxLength(100, { message: 'Имя не должно быть длиннее 100 символов' })
  name!: string

  @IndividualOrderPhonePropertyDocs()
  @Transform(({ value }) => normalizePhoneValue(value))
  @IsString({ message: 'Телефон должен быть строкой' })
  @IsNotEmpty({ message: 'Телефон обязателен' })
  @Matches(/^\+?\d{10,15}$/, {
    message: 'Телефон должен содержать от 10 до 15 цифр и может начинаться с +',
  })
  phone!: string

  @IndividualOrderEmailPropertyDocs()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsString({ message: 'Email должен быть строкой' })
  @IsNotEmpty({ message: 'Email обязателен' })
  @IsEmail({}, { message: 'Некорректный формат email' })
  email!: string

  @IndividualOrderMessagePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: 'Сообщение должно быть строкой' })
  @MaxLength(1000, {
    message: 'Сообщение не должно быть длиннее 1000 символов',
  })
  message?: string
}
