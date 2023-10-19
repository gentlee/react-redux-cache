import {normalize, schema} from 'normalizr'
import {generateMockUser} from './mocks'
import {User, Bank} from './types'
import {userSchema} from './schemas'
import {delay} from './utils'

export const getUsersSchema = new schema.Object({
  array: new schema.Array(userSchema),
})

export const getUsers = async ({page = 1, pageSize = 5}) => {
  await delay(1000)

  const result = {
    array: Array.from({length: pageSize}, (_, index) =>
      generateMockUser(index + pageSize * (page - 1))
    ),
    page,
    pageSize,
  }

  const normalizedResult: {
    result: {
      array: number[]
      page: number
      pageSize: number
    }
    entities: {
      users: Record<number, User>
      banks: Record<string, Bank>
    }
  } = normalize(result, getUsersSchema)

  console.log('< [getUsers]', {
    result,
    page,
    pageSize,
    normalizedResult,
  })

  return normalizedResult
}
