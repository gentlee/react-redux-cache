import {createCache} from 'react-redux-cache'

import {getUser, getUsers, removeUser, updateUser} from './api/mocks'
import {Bank, User} from './api/types'

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
} = createCache({
  name: 'cache',
  typenames: {
    users: {},
    banks: {},
  } as Typenames,
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
