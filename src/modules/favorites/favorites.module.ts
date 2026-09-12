import { Module } from '@nestjs/common'
import { ProductsModule } from '@modules/products'
import { UserModule } from '@modules/user/user.module'
import { FavoritesController } from './favorites.controller'
import { FavoritesService } from './favorites.service'

@Module({
  imports: [UserModule, ProductsModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
