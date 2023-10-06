import {users} from './mocks'
import {User} from './types'
import {delay} from './utils'

export const updateUser = async (user: Partial<User> & Pick<User, 'id'>) => {
  await delay(1000)

  const response = {
    entities: {
      users: {
        [user.id]: {
          ...(users.find((x) => x.id === user.id) as User),
          ...user,
        },
      },
    },
  }

  return response
}
