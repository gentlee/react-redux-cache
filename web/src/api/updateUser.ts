import {MutationResponse} from '../redux-cache'
import {users} from './mocks'
import {User} from './types'
import {delay} from './utils'

export const updateUser = async (user: Partial<User> & Pick<User, 'id'>) => {
  await delay(1000)

  const response = {
    result: 0,
    merge: {
      users: {
        [user.id]: {
          ...(users.find((x) => x.id === user.id) as User),
          ...user,
        },
      },
    },
  } satisfies MutationResponse<any, any>

  return response
}
