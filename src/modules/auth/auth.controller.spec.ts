import { AuthController } from './auth.controller'
import { REFRESH_TOKEN_COOKIE_NAME } from './auth.constants'
import type { PreparedRequest, UserWithoutPassword } from './auth.types'

describe('AuthController', () => {
  const user = {
    _id: 'user-id',
    email: 'john.swoosh@example.com',
    role: 'user',
    favoriteProductIds: [],
  } as unknown as UserWithoutPassword

  const request = {
    cookies: {
      [REFRESH_TOKEN_COOKIE_NAME]: 'old-refresh-token',
    },
  } as PreparedRequest

  const response = {} as never

  function createController() {
    const authService = {
      register: jest.fn().mockResolvedValue({
        user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
      login: jest.fn().mockResolvedValue({
        user,
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      }),
      getNewTokens: jest.fn().mockResolvedValue({
        user,
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      }),
      setRefreshTokenCookie: jest.fn(),
      clearRefreshTokenCookie: jest.fn(),
      logout: jest.fn().mockResolvedValue(true),
    }

    return {
      authService,
      controller: new AuthController(authService as never),
    }
  }

  it('returns access token in register response body and stores only refresh token in cookie', async () => {
    const { authService, controller } = createController()

    await expect(
      controller.register(request, {} as never, response),
    ).resolves.toEqual({
      user,
      accessToken: 'access-token',
    })

    expect(authService.setRefreshTokenCookie).toHaveBeenCalledWith(
      response,
      'refresh-token',
    )
  })

  it('returns access token in login response body and stores only refresh token in cookie', async () => {
    const { authService, controller } = createController()

    await expect(
      controller.login(request, {} as never, response),
    ).resolves.toEqual({
      user,
      accessToken: 'access-token',
    })

    expect(authService.setRefreshTokenCookie).toHaveBeenCalledWith(
      response,
      'refresh-token',
    )
  })

  it('returns refreshed access token in response body and rotates refresh cookie', async () => {
    const { authService, controller } = createController()

    await expect(controller.newTokens(request, response)).resolves.toEqual({
      user,
      accessToken: 'new-access-token',
    })

    expect(authService.clearRefreshTokenCookie).toHaveBeenCalledWith(response)
    expect(authService.setRefreshTokenCookie).toHaveBeenCalledWith(
      response,
      'new-refresh-token',
    )
  })
})
