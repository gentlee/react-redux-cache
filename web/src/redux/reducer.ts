import {getUser} from '../api/getUser'
import {getUsers} from '../api/getUsers'
import {updateUser} from '../api/updateUser'
import {createCacheReducer} from '../redux-cache'

export const queries = {
  getUsers: {
    query: getUsers,
  },
  getUser: {
    query: getUser,
    dataSelector: (state: any, params: any) => state.entities.users[params.id],
  },
}

export const mutations = {
  updateUser,
}

export const cacheReducer = createCacheReducer(['users', 'banks'], queries, mutations)
