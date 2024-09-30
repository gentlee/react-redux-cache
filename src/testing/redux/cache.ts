import {withTypenames} from '../../createCache'
import {getUser, getUsers, removeUser, updateUser} from '../api/mocks'
import type {Bank, User} from '../api/types'
import {logEvent} from '../api/utils'
import {TTL_TIMEOUT} from '../utils'

export type TestTypenames = {
  users: User
  banks: Bank
}

export const {
  cache,
  reducer,
  actions: {
    updateQueryStateAndEntities,
    updateMutationStateAndEntities,
    mergeEntityChanges,
    invalidateQuery,
    clearQueryState,
    clearMutationState,
  },
  selectors: {
    selectQueryState,
    selectQueryResult,
    selectQueryLoading,
    selectQueryError,
    selectQueryParams,
    selectQueryExpiresAt,
    selectMutationState,
    selectMutationResult,
    selectMutationLoading,
    selectMutationError,
    selectMutationParams,
    selectEntityById,
    selectEntities,
    selectEntitiesByTypename,
  },
  hooks: {useClient, useMutation, useQuery},
  utils: {applyEntityChanges},
} = withTypenames<TestTypenames>().createCache({
  name: 'cache',
  options: {
    logsEnabled: false,
    additionalValidation: true,
    // deepComparisonEnabled: false,
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
    },
    getUserTtl: {
      query: getUser,
      secondsToLive: TTL_TIMEOUT / 1000,
    },
    getUserExpires: {
      query: (id: number) => getUser(id).then((x) => ({...x, expiresAt: Date.now() + TTL_TIMEOUT})),
      secondsToLive: Infinity,
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

// Comments for manual type checks:

// updateQueryStateAndEntities('getUser', 'a', {
//   result: 0,
//   params: 0,
// })

// const state = reducer({} as ReturnType<typeof reducer>, null)
// state.entities.banks?.a
// state.queries.getUser.a.result
// state.queries.getUser.a.params
// state.queries.getUsers.a.result
// state.queries.getUsers.a.params
// state.mutations.removeUser.result
// state.mutations.removeUser.params
// state.mutations.updateUser.result
// state.mutations.updateUser.params
