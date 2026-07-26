import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { MongoModule } from '@common/mongo'
import { ThrottlerModule } from '@common/throttler'
import { CaptchaModule } from '@common/captcha'
import { UserModule } from './modules/user/user.module'
import { AuthModule } from './modules/auth/auth.module'
import { ProductsModule } from './modules/products/products.module'
import { FavoritesModule } from './modules/favorites/favorites.module'
import { FormsModule } from './modules/forms/forms.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongoModule,
    ThrottlerModule,
    CaptchaModule,
    UserModule,
    AuthModule,
    ProductsModule,
    FavoritesModule,
    FormsModule,
  ],
})
export class AppModule {}
