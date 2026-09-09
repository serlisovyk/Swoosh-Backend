import { createHash, createHmac, randomBytes } from 'crypto'
import type { AuthSessionMetadata } from './auth.types'
import type { Request } from 'express'

export function extractAuthSessionMetadata(request: Request): AuthSessionMetadata {
  return {
    userAgent: extractUserAgent(request),
    ip: extractIp(request),
  }
}

export const generateToken = (): string => randomBytes(32).toString('hex')

export const hashToken = (value: string): string =>
  createHash('sha256').update(value).digest('hex')

export const hashTokenWithSecret = (value: string, secret: string): string =>
  createHmac('sha256', secret).update(value).digest('hex')

function extractIp(request: Request): string | null {
  const forwardedFor = request.headers['x-forwarded-for']

  if (typeof forwardedFor === 'string') {
    return forwardedFor.split(',')[0]?.trim() || null
  }

  if (Array.isArray(forwardedFor)) {
    return forwardedFor[0]?.split(',')[0]?.trim() || null
  }

  return request.ip || null
}

function extractUserAgent(request: Request): string | null {
  const userAgent = request.headers['user-agent']

  if (typeof userAgent === 'string') {
    return userAgent.trim() || null
  }

  return null
}
