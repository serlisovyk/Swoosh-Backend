import { createHash, createHmac, randomBytes } from 'crypto'

export const generateToken = (): string => randomBytes(32).toString('hex')

export const hashToken = (value: string): string =>
  createHash('sha256').update(value).digest('hex')

export const hashTokenWithSecret = (value: string, secret: string): string =>
  createHmac('sha256', secret).update(value).digest('hex')
