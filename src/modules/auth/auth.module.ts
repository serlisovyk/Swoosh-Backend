import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@common/jwt'
import { UsersModule } from '@modules/users/users.module'
import { FavoritesModule } from '@modules/favorites'
import { EmailModule } from '@common/email'
import { JwtStrategy } from './strategies/jwt.strategy'
import { PasswordResetController } from './password-reset/password-reset.controller'
import { PasswordResetService } from './password-reset/password-reset.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule,
    UsersModule,
    FavoritesModule,
    EmailModule,
  ],
  controllers: [AuthController, PasswordResetController],
  providers: [AuthService, JwtStrategy, PasswordResetService],
})
export class AuthModule {}
