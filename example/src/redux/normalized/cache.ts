import {withTypenames} from 'rrc'
import {initializeForReact} from 'rrc/react'
import {initializeForRedux} from 'rrc/redux'

import {getUser, getUsers, removeUser, updateUser} from '../../backend/normalized/mocks'
import {Typenames} from '../../backend/normalized/types'

const cache = withTypenames<Typenames>().createCache({
  name: 'normalized',
  cacheStateKey: 'normalized',
  globals: {
    queries: {
      secondsToLive: 10 * 60,
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
    },
    removeUser: {
      mutation: removeUser,
    },
  },
})

export const normalized = {
  ...cache,
  ...initializeForRedux(cache),
  ...initializeForReact(cache),
}
