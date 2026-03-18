import {createCache, defaultGetCacheKey, ReduxStoreLike} from 'rrc'
import {initializeForReact} from 'rrc/react'
import {initializeForRedux} from 'rrc/redux'

import {getUser, getUsers, removeUser, updateUser} from '../backend/not-normalized/mocks'

const cacheNotNormalizedOptimized = createCache({
  name: 'cacheNotNormalized',
  cacheStateKey: 'cacheNotNormalized',
  globals: {
    queries: {
      secondsToLive: 10 * 60,
    },
  },
  queries: {
    getUsers: {
      query: getUsers,
      getCacheKey: () => 'feed',
      mergeResults: (oldResult, {result: newResult}, _, store) => {
        // we set getUser query results to prevent them from loading when UserScreen is opened for the first time
        const updateGetUserResults = () => {
          newResult.items.forEach((user) => {
            ;(store as ReduxStoreLike).dispatch(
              updateQueryStateAndEntities('getUser', defaultGetCacheKey(user.id), {
                result: user,
                params: user.id,
              }),
            )
          })
        }

        if (!oldResult || newResult.page === 1) {
          updateGetUserResults()
          return newResult
        }
        if (newResult.page === oldResult.page + 1) {
          updateGetUserResults()
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

const reduxNotNormalizedOptimized = initializeForRedux(cacheNotNormalizedOptimized)

const {
  actions: {updateQueryStateAndEntities},
} = reduxNotNormalizedOptimized

const reactNotNormalizedOptimized = initializeForReact(cacheNotNormalizedOptimized)

export const notNormalizedOptimized = {
  ...cacheNotNormalizedOptimized,
  ...reduxNotNormalizedOptimized,
  ...reactNotNormalizedOptimized,
}
