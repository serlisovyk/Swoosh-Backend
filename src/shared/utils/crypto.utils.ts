import { createHmac, randomBytes } from 'crypto'

export const generateToken = (): string => randomBytes(32).toString('hex')

export const hashTokenWithSecret = (value: string, secret: string): string =>
  createHmac('sha256', secret).update(value).digest('hex')
