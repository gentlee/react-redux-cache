import { normalize, schema } from "normalizr"
import { banks, users } from "./mocks"
import { User, Bank } from "./types"
import { userSchema } from "./schemas"
import { delay } from "./utils"

export const getUserSchema = new schema.Object({
  result: userSchema
})

export const getUser = async ({ id }: { id: number }) => {
  await delay(1000)
  
  const mockUser: User = users[id - 1] ?? {
    id,
    name: 'User ' + id,
    bank: {
      staticId: String(id),
      name: 'Bank ' + id
    }
  }

  const data = {
    result: {
      ...JSON.parse(JSON.stringify(mockUser)),
      newField: 'new field: ' + id
    }
  }

  const normalizedData: {
    result: number,
    entities: {
      users: Record<number, User>,
      banks: Record<string, Bank>
    }
  } = normalize(data, getUserSchema)

  console.log('[getUser]', {
    id,
    data,
    normalizedData
  })

  return normalizedData
}
