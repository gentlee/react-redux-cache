
import { getUser } from '../api/getUser'
import { getUsers } from '../api/getUsers'
import { updateUser } from '../api/updateUser'
import { InMemoryCache } from '../redux-cache'

export const cache = {
  queries: {
    getUsers: {
      // @ts-ignore
      query: getUsers,
    },
    getUser: {
      // @ts-ignore
      query: getUser,
      dataSelector: (state: any, params: any) => state.entities.users[params.id],
    }
  },
  mutations: {
    updateUser
  }
} satisfies InMemoryCache
