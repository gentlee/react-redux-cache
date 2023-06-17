
import { getUser } from '../api/getUser'
import { getUsers } from '../api/getUsers'
import { User, Bank } from '../api/types'
import { InMemoryCache } from '../redux-cache'

type Entities = {
  users: User,
  banks: Bank
}

// @ts-ignore
export const cache: InMemoryCache<Entities> = {
  entities: ['users', 'banks'],
  queries: {
    // @ts-ignore
    getUsers: {
      query: getUsers,
    },
    getUser: {
      query: getUser,
      dataSelector: (state: any, params: any) => state.entities.users[params.id],
    }
  }
}
