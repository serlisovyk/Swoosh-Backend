import { AuthService } from './auth.service'
import { REFRESH_TOKEN_COOKIE_NAME } from './auth.constants'

describe('AuthService token cookies', () => {
  function createService() {
    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'COOKIE_DOMAIN') return 'example.com'
        if (key === 'NODE_ENV') return 'production'
        return undefined
      }),
      getOrThrow: jest.fn((key: string) => {
        if (key === 'JWT_REFRESH_TOKEN_EXPIRES_DAYS') return 7
        throw new Error(`Unexpected config key: ${key}`)
      }),
    }

    const service = new AuthService(
      {} as never,
      {} as never,
      {} as never,
      configService as never,
      {} as never,
      {} as never,
    )

    return { service, configService }
  }

  it('sets only the HttpOnly refresh token cookie', () => {
    const { service } = createService()
    const response = {
      cookie: jest.fn(),
    }

    service.setRefreshTokenCookie(response as never, 'refresh-token')

    expect(response.cookie).toHaveBeenCalledTimes(1)
    expect(response.cookie).toHaveBeenCalledWith(
      REFRESH_TOKEN_COOKIE_NAME,
      'refresh-token',
      expect.objectContaining({
        httpOnly: true,
        secure: true,
        domain: 'example.com',
        sameSite: 'strict',
      }),
    )
  })
})
