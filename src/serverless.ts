import { NestFactory } from '@nestjs/core'
import { NestExpressApplication } from '@nestjs/platform-express'
import type { Request, Response } from 'express'
import { setupApp } from '@shared/config'
import { AppModule } from './app.module'

type ExpressHandler = (req: Request, res: Response) => void

let cachedHandlerPromise: Promise<ExpressHandler> | undefined

async function createHandler(): Promise<ExpressHandler> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule)

  setupApp(app)

  await app.init()

  return app.getHttpAdapter().getInstance()
}

function getHandler(): Promise<ExpressHandler> {
  if (!cachedHandlerPromise) {
    cachedHandlerPromise = createHandler().catch((error: unknown) => {
      cachedHandlerPromise = undefined
      throw error
    })
  }

  return cachedHandlerPromise
}

export default async function handler(req: Request, res: Response) {
  const server = await getHandler()

  server(req, res)
}
