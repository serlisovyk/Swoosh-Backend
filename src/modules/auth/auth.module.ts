import { Module } from '@nestjs/common'
import { PassportModule } from '@nestjs/passport'
import { JwtModule } from '@common/jwt'
import { UserModule } from '@modules/user/user.module'
import { FavoritesModule } from '@modules/favorites/favorites.module'
import { EmailModule } from '@common/email/email.module'
import { JwtStrategy } from './strategies/jwt.strategy'
import { AuthAccountController } from './auth-account/auth-account.controller'
import { AuthAccountService } from './auth-account/auth-account.service'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule,
    UserModule,
    FavoritesModule,
    EmailModule,
  ],
  controllers: [AuthController, AuthAccountController],
  providers: [AuthService, JwtStrategy, AuthAccountService],
})
export class AuthModule {}
