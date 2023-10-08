import {User} from './types'
import {delay} from './utils'

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const removeUser = async (id: User['id']) => {
  await delay(1000)

  return {} // TODO remove user
}
