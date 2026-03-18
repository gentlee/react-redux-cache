import {createCache, ReduxStoreLike} from 'rrc'
import {initializeForReact} from 'rrc/react'
import {initializeForRedux} from 'rrc/redux'

import {getUser, getUsers, removeUser, updateUser} from '../backend/not-normalized/mocks'

export const cacheNotNormalized = createCache({
  name: 'notNormalized',
  cacheStateKey: 'notNormalized',
  globals: {
    queries: {
      secondsToLive: 5 * 60,
    },
  },
  queries: {
    getUsers: {
      query: getUsers,
      getCacheKey: () => 'feed',
      mergeResults: (oldResult, {result: newResult}) => {
        if (!oldResult || newResult.page === 1) {
          return newResult
        }
        if (newResult.page === oldResult.page + 1) {
          return {
            ...newResult,
            items: oldResult.items.concat(newResult.items),
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
      onSuccess(_, __, store) {
        ;(store as ReduxStoreLike).dispatch(invalidateQuery([{query: 'getUsers'}]))
      },
    },
    removeUser: {
      mutation: removeUser,
    },
  },
})

export const reduxNotNormalized = initializeForRedux(cacheNotNormalized)

const {
  actions: {invalidateQuery},
} = reduxNotNormalized

export const reactNotNormalized = initializeForReact(cacheNotNormalized)

export const notNormalized = {
  ...cacheNotNormalized,
  ...reduxNotNormalized,
  ...reactNotNormalized,
}
