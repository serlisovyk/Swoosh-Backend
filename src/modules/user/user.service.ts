import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectModel } from '@nestjs/mongoose'
import { mongo } from 'mongoose'
import { hash, verify } from 'argon2'
import { hashTokenWithSecret } from '@shared/utils'
import { THIRTY_MINUTES_IN_MS } from '@shared/constants'
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
import { ROLES, type CreateUserInput, type UserModel } from './user.types'

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

  async create(input: CreateUserInput) {
    const preparedEmail = input.email.toLowerCase()

    const isExisting = await this.getByEmail(preparedEmail)

    if (isExisting) throw new ConflictException(USER_ALREADY_EXISTS_ERROR)

    try {
      const newUser = await this.userModel.create({
        name: input.name,
        phone: input.phone,
        email: preparedEmail,
        role: ROLES.USER,
        password: await hash(input.password),
      })

      return this.getById(newUser._id)
    } catch (error) {
      if (this.isDuplicateKeyError(error)) {
        throw new ConflictException(USER_ALREADY_EXISTS_ERROR)
      }

      throw error
    }
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

  consumePasswordResetToken(token: string) {
    const hashedToken = hashTokenWithSecret(
      token,
      this.configService.getOrThrow<string>('RESET_TOKEN_SECRET'),
    )

    return this.userModel
      .findOneAndUpdate(
        {
          resetPasswordToken: hashedToken,
          resetPasswordTokenExpiresAt: { $gt: new Date() },
        },
        {
          resetPasswordToken: null,
          resetPasswordTokenExpiresAt: null,
        },
      )
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

  async resetPassword(userId: string, newPassword: string) {
    return this.userModel.findByIdAndUpdate(userId, {
      password: await hash(newPassword),
    })
  }

  async getFavoriteProductIdsWithVersion(userId: string) {
    const user = await this.userModel
      .findById(userId)
      .select('favoriteProductIds __v')
      .lean()

    if (!user) return null

    return {
      favoriteProductIds: user.favoriteProductIds,
      version: user.__v ?? 0,
    }
  }

  async updateFavoriteProductIdsIfVersionMatches(
    userId: string,
    version: number,
    nextFavoriteProductIds: string[],
  ) {
    const updatedUser = await this.userModel
      .findOneAndUpdate(
        { _id: userId, __v: version },
        {
          $set: { favoriteProductIds: nextFavoriteProductIds },
          $inc: { __v: 1 },
        },
        { returnDocument: 'after' },
      )
      .select('favoriteProductIds')
      .lean()

    return updatedUser ? updatedUser.favoriteProductIds : null
  }

  private isDuplicateKeyError(error: unknown) {
    return error instanceof mongo.MongoServerError && error.code === 11000
  }
}
