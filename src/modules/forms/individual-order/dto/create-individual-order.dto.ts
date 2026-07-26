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
import {
  INDIVIDUAL_ORDER_EMAIL_EMPTY_ERROR,
  INDIVIDUAL_ORDER_EMAIL_FORMAT_ERROR,
  INDIVIDUAL_ORDER_EMAIL_STRING_ERROR,
  INDIVIDUAL_ORDER_MESSAGE_MAX_LENGTH_ERROR,
  INDIVIDUAL_ORDER_MESSAGE_STRING_ERROR,
  INDIVIDUAL_ORDER_NAME_EMPTY_ERROR,
  INDIVIDUAL_ORDER_NAME_MAX_LENGTH_ERROR,
  INDIVIDUAL_ORDER_NAME_STRING_ERROR,
  INDIVIDUAL_ORDER_PHONE_EMPTY_ERROR,
  INDIVIDUAL_ORDER_PHONE_FORMAT_ERROR,
  INDIVIDUAL_ORDER_PHONE_STRING_ERROR,
} from '../individual-order.constants'

export class CreateIndividualOrderDto {
  @IndividualOrderNamePropertyDocs()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: INDIVIDUAL_ORDER_NAME_STRING_ERROR })
  @IsNotEmpty({ message: INDIVIDUAL_ORDER_NAME_EMPTY_ERROR })
  @MaxLength(100, { message: INDIVIDUAL_ORDER_NAME_MAX_LENGTH_ERROR })
  name!: string

  @IndividualOrderPhonePropertyDocs()
  @Transform(({ value }) => normalizePhoneValue(value))
  @IsString({ message: INDIVIDUAL_ORDER_PHONE_STRING_ERROR })
  @IsNotEmpty({ message: INDIVIDUAL_ORDER_PHONE_EMPTY_ERROR })
  @Matches(/^\+?\d{10,15}$/, {
    message: INDIVIDUAL_ORDER_PHONE_FORMAT_ERROR,
  })
  phone!: string

  @IndividualOrderEmailPropertyDocs()
  @Transform(({ value }) => normalizeEmailValue(value))
  @IsString({ message: INDIVIDUAL_ORDER_EMAIL_STRING_ERROR })
  @IsNotEmpty({ message: INDIVIDUAL_ORDER_EMAIL_EMPTY_ERROR })
  @IsEmail({}, { message: INDIVIDUAL_ORDER_EMAIL_FORMAT_ERROR })
  email!: string

  @IndividualOrderMessagePropertyDocs()
  @IsOptional()
  @Transform(({ value }) => trimStringValue(value))
  @IsString({ message: INDIVIDUAL_ORDER_MESSAGE_STRING_ERROR })
  @MaxLength(1000, { message: INDIVIDUAL_ORDER_MESSAGE_MAX_LENGTH_ERROR })
  message?: string
}
