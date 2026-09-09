import { AuthService } from './auth.service'
import { REFRESH_TOKEN_COOKIE_NAME } from './auth.constants'
import type { PreparedRequest, UserWithoutPassword } from './auth.types'

describe('AuthService token cookies', () => {
  const user = {
    _id: 'user-id',
    email: 'john.swoosh@example.com',
    role: 'user',
    favoriteProductIds: [],
  } as unknown as UserWithoutPassword

  function createService() {
    const jwt = {
      sign: jest.fn((payload: unknown) =>
        JSON.stringify({ type: 'signed-token', payload }),
      ),
      verifyAsync: jest.fn().mockResolvedValue({ id: user._id }),
    }

    const userService = {
      getById: jest.fn().mockResolvedValue(user),
    }

    const configService = {
      get: jest.fn((key: string) => {
        if (key === 'COOKIE_DOMAIN') return 'example.com'
        if (key === 'NODE_ENV') return 'production'
        if (key === 'JWT_ACCESS_TOKEN_EXPIRES_IN') return '15m'
        if (key === 'JWT_REFRESH_TOKEN_EXPIRES_IN') return '7d'
        return undefined
      }),
      getOrThrow: jest.fn((key: string) => {
        if (key === 'JWT_REFRESH_TOKEN_EXPIRES_DAYS') return 7
        if (key === 'JWT_REFRESH_SECRET') return 'refresh-secret'
        throw new Error(`Unexpected config key: ${key}`)
      }),
    }

    const service = new AuthService(
      jwt as never,
      userService as never,
      {} as never,
      configService as never,
      {} as never,
    )

    return { service, jwt, userService, configService }
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

  it('refreshes tokens from a valid stateless refresh token without auth session storage', async () => {
    const { service, jwt, userService } = createService()

    await expect(
      service.getNewTokens('refresh-token', {} as PreparedRequest),
    ).resolves.toEqual({
      user,
      accessToken: JSON.stringify({
        type: 'signed-token',
        payload: { id: user._id, role: user.role },
      }),
      refreshToken: JSON.stringify({
        type: 'signed-token',
        payload: { id: user._id },
      }),
    })

    expect(jwt.verifyAsync).toHaveBeenCalledWith('refresh-token', {
      secret: 'refresh-secret',
    })
    expect(userService.getById).toHaveBeenCalledWith(user._id)
  })

  it('logout succeeds without server-side session revocation', () => {
    const { service } = createService()

    expect(service.logout()).toBe(true)
  })
})
