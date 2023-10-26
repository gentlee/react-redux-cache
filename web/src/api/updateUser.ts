import {normalize} from 'normalizr'
import {User} from './types'
import {delay} from './utils'
import {userSchema} from './schemas'
import {generateMockUser} from './mocks'

export const updateUser = async (user: Partial<Omit<User, 'bank'>> & Pick<User, 'id'>) => {
  await delay(1000)

  const response = {
    ...generateMockUser(user.id),
    ...user,
  }

  const result = normalize(response, userSchema)

  return result
}
