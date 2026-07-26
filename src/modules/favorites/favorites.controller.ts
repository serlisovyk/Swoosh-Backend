import {
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
} from '@nestjs/common'
import { ParseObjectIdPipe } from '@nestjs/mongoose'
import { Auth } from '@modules/auth/decorators/auth.decorator'
import { CurrentUser } from '@modules/auth/decorators/user.decorator'
import { FindAllFavoritesDto } from './dto/find-all-favorites.dto'
import { FavoritesService } from './favorites.service'
import {
  FavoritesAddDocs,
  FavoritesFindAllDocs,
  FavoritesRemoveDocs,
  FavoritesTagDocs,
} from './favorites.swagger'

@FavoritesTagDocs()
@Auth()
@Controller('favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @FavoritesFindAllDocs()
  @Get()
  findAll(
    @CurrentUser('_id') userId: string,
    @Query() dto: FindAllFavoritesDto,
  ) {
    return this.favoritesService.findAll(userId, dto)
  }

  @FavoritesAddDocs()
  @Put(':productId')
  add(
    @CurrentUser('_id') userId: string,
    @Param('productId', ParseObjectIdPipe) productId: string,
  ) {
    return this.favoritesService.add(userId, productId)
  }

  @FavoritesRemoveDocs()
  @Delete(':productId')
  remove(
    @CurrentUser('_id') userId: string,
    @Param('productId', ParseObjectIdPipe) productId: string,
  ) {
    return this.favoritesService.remove(userId, productId)
  }
}
