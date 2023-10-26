import {User} from './types'
import {delay} from './utils'

export const removeUser = async (id: User['id']) => {
  await delay(1000)

  return {
    remove: {
      users: [id],
    },
  }
}
