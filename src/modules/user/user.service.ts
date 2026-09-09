import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { hash, verify } from 'argon2'
import { RegisterDto } from '@modules/auth/dto/register.dto'
import { hashToken, hashTokenWithSecret } from '@modules/auth/auth.utils'
import { ONE_HOUR_IN_MS, THIRTY_MINUTES_IN_MS } from '@shared/constants'
import { UpdateUserDto } from './dto/update-user.dto'
import { User } from './models/user.model'
import {
  USER_ALREADY_EXISTS_ERROR,
  CURRENT_PASSWORD_REQUIRED_ERROR,
  USER_BASE_SELECT_FIELDS,
  USER_NOT_FOUND_ERROR,
  USER_PUBLIC_SELECT_FIELDS,
  WRONG_CURRENT_PASSWORD_ERROR,
} from './user.constants'
import { ROLES, type UserModel } from './user.types'

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: UserModel,
    private readonly configService: ConfigService,
  ) {}

  getById(id: string) {
    return this.userModel.findById(id).select(USER_PUBLIC_SELECT_FIELDS).lean()
  }

  getByEmail(email: string) {
    return this.userModel
      .findOne({ email })
      .select(USER_PUBLIC_SELECT_FIELDS)
      .lean()
  }

  getByEmailWithPassword(email: string) {
    return this.userModel
      .findOne({ email })
      .select(`+password ${USER_BASE_SELECT_FIELDS}`)
      .lean()
  }

  async create(dto: RegisterDto) {
    const preparedEmail = dto.email.toLowerCase()

    const isExisting = await this.getByEmail(preparedEmail)

    if (isExisting) throw new ConflictException(USER_ALREADY_EXISTS_ERROR)

    const newUser = await this.userModel.create({
      name: dto.name,
      phone: dto.phone,
      email: preparedEmail,
      role: ROLES.USER,
      isEmailVerified: false,
      password: await hash(dto.password),
    })

    return this.getById(newUser._id)
  }

  async update(userId: string, dto: UpdateUserDto) {
    const data = await this.prepareUpdateData(userId, dto)

    const updatedUser = await this.userModel
      .findByIdAndUpdate(userId, data, {
        returnDocument: 'after',
        runValidators: true,
      })
      .select(USER_PUBLIC_SELECT_FIELDS)
      .lean()

    if (!updatedUser) {
      throw new NotFoundException(USER_NOT_FOUND_ERROR)
    }

    return updatedUser
  }

  private async prepareUpdateData(userId: string, dto: UpdateUserDto) {
    const data: Record<string, unknown> = { ...dto }

    const { email, newPassword, currentPassword } = dto

    if (email) {
      data.email = await this.ensureEmailIsAvailable(userId, email)
    }

    if (newPassword && newPassword.trim() !== '') {
      await this.validateCurrentPassword(userId, currentPassword)
      data.password = await hash(newPassword)
    }

    delete data.newPassword
    delete data.currentPassword

    return data
  }

  private async ensureEmailIsAvailable(userId: string, email: string) {
    const existingUser = await this.userModel
      .findOne({ email, _id: { $ne: userId } })
      .select('_id')
      .lean()

    if (existingUser) {
      throw new ConflictException(USER_ALREADY_EXISTS_ERROR)
    }

    return email
  }

  private async validateCurrentPassword(
    userId: string,
    currentPassword?: string,
  ) {
    if (!currentPassword || currentPassword.trim() === '') {
      throw new BadRequestException(CURRENT_PASSWORD_REQUIRED_ERROR)
    }

    const user = await this.userModel.findById(userId).select('+password')

    if (!user) throw new UnauthorizedException(WRONG_CURRENT_PASSWORD_ERROR)

    const isPasswordValid = await verify(user.password, currentPassword)

    if (!isPasswordValid) {
      throw new UnauthorizedException(WRONG_CURRENT_PASSWORD_ERROR)
    }
  }

  findByPasswordResetToken(token: string) {
    const hashedToken = hashTokenWithSecret(
      token,
      this.configService.getOrThrow<string>('RESET_TOKEN_SECRET'),
    )

    const legacyHashedToken = hashToken(token)

    return this.userModel
      .findOne({
        resetPasswordToken: { $in: [hashedToken, legacyHashedToken, token] },
        resetPasswordTokenExpiresAt: { $gt: new Date() },
      })
      .lean()
  }

  findByEmailVerificationToken(token: string) {
    const hashedToken = hashTokenWithSecret(
      token,
      this.configService.getOrThrow<string>('EMAIL_VERIFICATION_TOKEN_SECRET'),
    )

    return this.userModel
      .findOne({
        emailVerificationToken: hashedToken,
        emailVerificationTokenExpiresAt: { $gt: new Date() },
      })
      .lean()
  }

  setPasswordResetToken(userId: string, token: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      resetPasswordToken: hashTokenWithSecret(
        token,
        this.configService.getOrThrow<string>('RESET_TOKEN_SECRET'),
      ),
      resetPasswordTokenExpiresAt: new Date(Date.now() + THIRTY_MINUTES_IN_MS),
    })
  }

  setEmailVerificationToken(userId: string, token: string) {
    const expiresHours = this.configService.getOrThrow<number>(
      'EMAIL_VERIFICATION_TOKEN_EXPIRES_HOURS',
    )

    const emailVerificationToken = hashTokenWithSecret(
      token,
      this.configService.getOrThrow<string>('EMAIL_VERIFICATION_TOKEN_SECRET'),
    )

    return this.userModel.findByIdAndUpdate(userId, {
      emailVerificationToken,
      emailVerificationTokenExpiresAt: new Date(
        Date.now() + expiresHours * ONE_HOUR_IN_MS,
      ),
    })
  }

  async resetPassword(userId: string, newPassword: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      password: await hash(newPassword),
      resetPasswordToken: null,
      resetPasswordTokenExpiresAt: null,
    })
  }

  markEmailAsVerified(userId: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailVerificationTokenExpiresAt: null,
    })
  }
}
