import {createCache} from 'react-redux-cache'

import {getUser, getUsers, removeUser, updateUser} from './api/mocks'

export const cacheNotNormalized = createCache({
  name: 'cacheNotNormalized',
  globals: {
    secondsToLive: 5 * 60,
  },
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
      onSuccess(_, __, {dispatch}) {
        dispatch(cacheNotNormalized.actions.invalidateQuery([{query: 'getUsers'}]))
      },
    },
    removeUser: {
      mutation: removeUser,
    },
  },
})
