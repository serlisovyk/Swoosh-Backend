import { IsNotEmpty, IsString } from 'class-validator'

export class MongoConfig {
  @IsString()
  @IsNotEmpty()
  MONGO_URI!: string
}
