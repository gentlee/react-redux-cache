import {createCache} from '../../createCache'
import {getUser, getUsers, removeUser, updateUser} from '../api/mocks'
import type {Bank, User} from '../api/types'
import {logEvent} from '../api/utils'

export type TestTypenames = {
  users: User
  banks: Bank
}

export type ReduxState = ReturnType<typeof reducer>

export const {
  cache,
  reducer,
  actions: {
    updateQueryStateAndEntities,
    updateMutationStateAndEntities,
    mergeEntityChanges,
    clearQueryState,
    clearMutationState,
  },
  selectors: {entitiesSelector, entitiesByTypenameSelector},
  hooks: {useClient, useMutation, useQuery, useSelectEntityById},
  utils: {applyEntityChanges},
} = createCache({
  cacheStateSelector: (state) => state,
  options: {
    logsEnabled: false,
    validateFunctionArguments: true,
  },
  typenames: {
    users: {} as User,
    banks: {} as Bank,
  },
  queries: {
    getUsers: {
      query: getUsers,
      getCacheKey: () => 'all-pages',
      mergeResults: (oldResult, {result: newResult}) => {
        if (!oldResult || newResult.page === 1) {
          logEvent('merge results: first page')
          return newResult
        }
        if (newResult.page === oldResult.page + 1) {
          logEvent('merge results: next page')
          return {
            ...newResult,
            items: [...oldResult.items, ...newResult.items],
          }
        }
        logEvent('merge results: cancelled')
        return oldResult
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

// updateQueryStateAndEntities('getUser', 'a', {
//   result: 0,
// })

// const state = reducer({} as ReturnType<typeof reducer>, null)
// state.entities.banks.a
// state.queries.getUser.a.result
// state.queries.getUsers.a.result
// state.mutations.removeUser.result
// state.mutations.updateUser.result
