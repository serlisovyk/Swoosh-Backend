import { UserController } from './user.controller'
import type { UserWithoutPassword } from '@modules/auth/auth.types'

describe('UserController', () => {
  it('updates profile without requiring email verification', async () => {
    const user = {
      _id: 'user-id',
      email: 'john.swoosh@example.com',
      isEmailVerified: false,
    } as unknown as UserWithoutPassword

    const updatedUser = {
      ...user,
      name: 'John',
    }

    const userService = {
      update: jest.fn().mockResolvedValue(updatedUser),
    }

    const controller = new UserController(userService as never)

    await expect(controller.updateProfile(user, { name: 'John' })).resolves.toEqual(
      updatedUser,
    )
  })
})
