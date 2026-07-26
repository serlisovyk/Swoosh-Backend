import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { JwtModule } from '@nestjs/jwt'
import { MongooseModule } from '@nestjs/mongoose'
import { PassportModule } from '@nestjs/passport'
import { UserModule } from '@modules/user/user.module'
import { FavoritesModule } from '@modules/favorites/favorites.module'
import { EmailModule } from '@common/email/email.module'
import { getJwtConfig } from './jwt.config'
import { JwtStrategy } from './strategies/jwt.strategy'
import { GoogleStrategy } from './strategies/google.strategy'
import { GithubStrategy } from './strategies/github.strategy'
import { GoogleAuthGuard } from './guards/google-auth.guard'
import { GithubAuthGuard } from './guards/github-auth.guard'
import { SocialAuthController } from './social-auth/social-auth.controller'
import { SocialAuthService } from './social-auth/social-auth.service'
import { AuthAccountController } from './auth-account/auth-account.controller'
import { AuthAccountService } from './auth-account/auth-account.service'
import { AuthController } from './auth.controller'
import { AuthSessionController } from './auth-session.controller'
import { AuthService } from './auth.service'
import {
  AuthSession,
  AuthSessionSchema,
} from './auth-session/models/auth-session.model'
import { AuthSessionService } from './auth-session/auth-session.service'

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: AuthSession.name, schema: AuthSessionSchema },
    ]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: getJwtConfig,
      inject: [ConfigService],
    }),
    UserModule,
    FavoritesModule,
    EmailModule,
  ],
  controllers: [
    AuthController,
    AuthSessionController,
    AuthAccountController,
    SocialAuthController,
  ],
  providers: [
    AuthService,
    JwtStrategy,
    GoogleStrategy,
    GithubStrategy,
    GoogleAuthGuard,
    GithubAuthGuard,
    AuthSessionService,
    SocialAuthService,
    AuthAccountService,
  ],
})
export class AuthModule {}
