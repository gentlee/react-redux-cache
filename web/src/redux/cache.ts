import {getUser} from '../api/getUser'
import {getUsers} from '../api/getUsers'
import {removeUser} from '../api/removeUser'
import {User, Bank} from '../api/types'
import {updateUser} from '../api/updateUser'
import {createCache} from '../redux-cache'

export const {cache, reducer, useMutation, useQuery} = createCache({
  typenames: {
    users: {},
    banks: {},
  } as {
    users: User
    banks: Bank
  },
  queries: {
    getUsers: {
      query: getUsers,
      cacheOptions: 'cache-first',
      getParamsKey: (params: any) => params?.page ?? 0,
      getCacheKey: () => 'all-pages',
      mergeResults: (oldData: any, newData: any) => {
        if (!oldData || newData.page === 1) {
          return newData
        }
        return {
          ...newData,
          array: [...oldData.array, ...newData.array],
        }
      },
    },
    getUser: {
      query: getUser,
      dataSelector: (state: any, params: any) => state.entities.users[params.id],
    },
  },
  mutations: {
    updateUser,
    removeUser,
  },
})

// const state = reducer({} as ReturnType<typeof reducer>, {type: 'redux-light/SET_STATE', state: {}})
