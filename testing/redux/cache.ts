import {createCache} from '../../src/createCache'
import {getUser, getUsers, removeUser, updateUser} from '../api/mocks'
import {Bank, User} from '../api/types'

export type TestTypenames = {
  users: User
  banks: Bank
}

export const {
  cache,
  reducer,
  actions: {setQueryStateAndEntities, setMutationStateAndEntities, mergeEntityChanges},
  selectors: {entitiesSelector, entitiesByTypenameSelector},
  hooks: {useClient, useMutation, useQuery, useSelectEntityById},
} = createCache({
  cacheStateSelector: (state) => state,
  options: {
    logsEnabled: true,
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
          items: [...oldResult.items, ...newResult.items],
        }
      },
    },
    getUser: {
      query: getUser,
      resultSelector: (state, id) => state.entities.users[id]?.id,
    },
    getUserNoSelector: {
      query: getUser,
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
