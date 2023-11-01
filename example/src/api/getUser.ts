import {normalize} from 'normalizr'

import {generateMockUser} from './mocks'
import {userSchema} from './schemas'
import {Bank, User} from './types'
import {delay} from './utils'

export const getUserSchema = userSchema

export const getUser = async (id: number) => {
  await delay(1000)

  const result = {
    ...generateMockUser(id),
    newField: 'new field: ' + id,
  }

  const normalizedResult: {
    result: number
    entities: {
      users: Record<number, User>
      banks: Record<string, Bank>
    }
  } = normalize(result, getUserSchema)

  console.log('< [getUser]', {
    id,
    result,
    normalizedResult,
  })

  return normalizedResult
}
