import {normalize} from 'normalizr'
import {generateMockUser} from './mocks'
import {User, Bank} from './types'
import {userSchema} from './schemas'
import {delay} from './utils'

export const getUserSchema = userSchema

export const getUser = async ({id}: {id: number}) => {
  await delay(1000)

  const data = {
    ...generateMockUser(id),
    newField: 'new field: ' + id,
  }

  const normalizedData: {
    result: number
    entities: {
      users: Record<number, User>
      banks: Record<string, Bank>
    }
  } = normalize(data, getUserSchema)

  console.log('< [getUser]', {
    id,
    data,
    normalizedData,
  })

  return normalizedData
}
