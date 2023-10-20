import {getUser} from '../api/getUser'
import {getUsers} from '../api/getUsers'
import {removeUser} from '../api/removeUser'
import {User, Bank} from '../api/types'
import {updateUser} from '../api/updateUser'
import {createCache} from '../redux-cache'

export const {
  cache,
  reducer,
  useMutation,
  useQuery,
  actions,
  selectors: {useDenormalizeSelector},
} = createCache({
  typenames: {
    users: {} as User,
    banks: {} as Bank,
  },
  queries: {
    getUsers: {
      query: getUsers,
      cacheOptions: 'cache-first',
      getParamsKey: (params) => params?.page ?? 0,
      getCacheKey: () => 'all-pages',
      mergeResults: (oldResult, {result: newResult}) => {
        if (!oldResult || newResult.page === 1) {
          return newResult
        }
        return {
          ...newResult,
          array: [...oldResult.array, ...newResult.array],
        }
      },
    },
    getUser: {
      query: getUser,
      resultSelector: (state, {id}: {id: number}) => (state.entities.users[id] as User)?.id,
    },
  },
  mutations: {
    updateUser: {
      mutation: updateUser,
    },
    removeUser: {
      mutation: removeUser,
    },
  },
})

// actions.setQueryStateAndEntities('getUser', 'a', {
//   result: 0,
// })

// const state = reducer({} as ReturnType<typeof reducer>, {type: 'redux-light/SET_STATE', state: {}})
// state.entities.banks.a
// state.queries.getUser.a.result
// state.queries.getUsers.a.result
// state.mutations.removeUser.result
// state.mutations.updateUser.result
