import {createCache, defaultGetCacheKey, Mutation, ReduxStoreLike} from 'rrc'
import {initializeForReact} from 'rrc/react'
import {initializeForRedux} from 'rrc/redux'

import {getUser, getUsers, removeUser, updateUser} from '../../backend/not-normalized/mocks'

const cache = createCache({
  name: 'cacheNotNormalizedOptimized',
  cacheStateKey: 'cacheNotNormalizedOptimized',
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
        // Setting getUser query results to prevent them from loading when UserScreen is opened for the first time
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
      // Updating getUser and getUsers results after successfull mutation.
      // Refetch instead can be used, but this will cause additional requests.
      // Normalization approach does that automatically.
      onSuccess: (response, _, store) => {
        store = store as ReduxStoreLike

        const {result: updatedUser} = response

        // Update getUser result
        store.dispatch(updateQueryStateAndEntities('getUser', defaultGetCacheKey(updatedUser.id), response))

        // Update getUsers result
        const getUsersState = selectQueryState(store.getState(), 'getUsers', 'feed')
        if (getUsersState) {
          const userIndex = getUsersState.result?.items.findIndex((x) => x.id === updatedUser.id)
          if (getUsersState.result && userIndex != null && userIndex != -1) {
            const newUsersResult = {
              ...getUsersState.result,
              items: [...getUsersState.result.items],
            }
            newUsersResult.items.splice(userIndex, 1, updatedUser)
            store.dispatch(updateQueryStateAndEntities('getUsers', 'feed', {result: newUsersResult}))
          }
        }
      },
    },
    removeUser: {
      mutation: removeUser,
    },
  },
})

export const notNormalizedOptimized = {
  ...cache,
  ...initializeForRedux(cache),
  ...initializeForReact(cache),
}

const {
  actions: {updateQueryStateAndEntities},
  selectors: {selectQueryState},
} = notNormalizedOptimized
