import {normalize} from 'normalizr'

import {generateMockUser} from './mocks'
import {userSchema} from './schemas'
import {User} from './types'
import {delay} from './utils'

export const updateUser = async (user: Partial<Omit<User, 'bank'>> & Pick<User, 'id'>) => {
  await delay(1000)

  const response = {
    ...generateMockUser(user.id),
    ...user,
  }

  const result = normalize(response, userSchema)

  return result
}
