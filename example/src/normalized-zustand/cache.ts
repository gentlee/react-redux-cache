import {withTypenames} from 'react-redux-cache'

import {getUser, getUsers, removeUser, updateUser} from '../normalized/api/mocks'
import {Bank, User} from '../normalized/api/types'

export type Typenames = {
  users: User
  banks: Bank
}

export const {
  cache,
  reducer,
  selectors: {selectEntitiesByTypename},
  actions: {updateQueryStateAndEntities, updateMutationStateAndEntities, mergeEntityChanges},
  hooks: {useClient, useMutation, useQuery, useSelectEntityById},
} = withTypenames<Typenames>().createCache({
  name: 'cache',
  globals: {
    queries: {
      secondsToLive: 10 * 60,
    },
  },
  storeHooks: {},
  queries: {
    getUsers: {
      query: getUsers,
      getCacheKey: () => 'all-pages',
      mergeResults: (oldResult, {result: newResult}) => {
        if (!oldResult || newResult.page === 1) {
          return newResult
        }
        if (newResult.page === oldResult.page + 1) {
          return {
            ...newResult,
            items: [...oldResult.items, ...newResult.items],
          }
        }
        return oldResult
      },
    },
    getUser: {
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
