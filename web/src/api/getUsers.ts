import { normalize, schema } from "normalizr"
import { usersJSON } from "./mocks"
import { User, Bank } from "./types"
import { userSchema } from "./schemas"
import { delay } from "./utils"

export const getUsersSchema = new schema.Object({
  array: new schema.Array(userSchema)
})

export const getUsers = async (params: { id: string }) => {
  await delay(1000)
  
  const data = {
    array: JSON.parse(usersJSON)
  }

  const normalizedData: {
    result: {
      array: number[]
    },
    entities: {
      users: Record<number, User>,
      banks: Record<string, Bank>
    }
  } = normalize(data, getUsersSchema)

  console.log('[getUsers]', {
    params,
    data,
    normalizedData
  })

  return normalizedData
}
