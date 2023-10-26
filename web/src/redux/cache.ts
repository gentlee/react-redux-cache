import {getUser} from '../api/getUser'
import {getUsers} from '../api/getUsers'
import {removeUser} from '../api/removeUser'
import {User, Bank} from '../api/types'
import {updateUser} from '../api/updateUser'
import {createCache} from '../redux-cache'

export const {
  cache,
  reducer,
  actions: {setQueryStateAndEntities, setMutationStateAndEntities, mergeEntityChanges},
  hooks: {useMutation, useQuery, useSelectDenormalized, useSelectEntityById},
} = createCache({
  cacheStateSelector: (state) => state,
  options: {
    logsEnabled: false,
  },
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
      resultSelector: (state, {id}) => state.entities.users[id]?.id,
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

// setQueryStateAndEntities('getUser', 'a', {
//   result: 0,
// })

// const state = reducer({} as ReturnType<typeof reducer>, null)
// state.entities.banks.a
// state.queries.getUser.a.result
// state.queries.getUsers.a.result
// state.mutations.removeUser.result
// state.mutations.updateUser.result
