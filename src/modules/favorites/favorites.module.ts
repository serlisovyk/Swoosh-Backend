import { Module } from '@nestjs/common'
import { ProductsModule } from '@modules/products/products.module'
import { UsersModule } from '@modules/users/users.module'
import { FavoritesController } from './favorites.controller'
import { FavoritesService } from './favorites.service'

@Module({
  imports: [UsersModule, ProductsModule],
  controllers: [FavoritesController],
  providers: [FavoritesService],
  exports: [FavoritesService],
})
export class FavoritesModule {}
