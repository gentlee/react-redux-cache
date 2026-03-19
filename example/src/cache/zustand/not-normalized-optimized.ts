import {createCache, defaultGetCacheKey} from 'rrc'
import {initializeForReact} from 'rrc/react'
import {initializeForZustand} from 'rrc/zustand'
import {create} from 'zustand'

import {getUser, getUsers, removeUser, updateUser} from '../../backend/not-normalized/mocks'

const cache = createCache({
  name: 'zustand-not-normalized',
  cacheStateKey: '.',
  globals: {
    queries: {
      secondsToLive: 10 * 60,
    },
  },
  queries: {
    getUsers: {
      query: getUsers,
      getCacheKey: () => 'feed',
      mergeResults: (oldResult, {result: newResult}, _) => {
        // Setting getUser query results to prevent them from loading when UserScreen is opened for the first time
        const updateGetUserResults = () => {
          newResult.items.forEach((user) => {
            updateQueryStateAndEntities('getUser', defaultGetCacheKey(user.id), {
              result: user,
              params: user.id,
            })
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
        const {result: updatedUser} = response

        // Update getUser result
        updateQueryStateAndEntities('getUser', defaultGetCacheKey(updatedUser.id), response)

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
            updateQueryStateAndEntities('getUsers', 'feed', {result: newUsersResult})
          }
        }
      },
    },
    removeUser: {
      mutation: removeUser,
    },
  },
})

const initialState = Object.freeze(cache.utils.getInitialState())

const useStore = create(() => initialState)

const originalSetState = useStore.setState
useStore.setState = (...args) => {
  console.debug('@zustand-not-normalized-optimized/setState', ...args)
  // @ts-expect-error TODO fix types
  originalSetState(...args)
}

export const zustandNotNormalizedOptimized = {
  ...cache,
  ...initializeForZustand(cache, useStore),
  ...initializeForReact(cache),
}

const {
  selectors: {selectQueryState},
  actions: {updateQueryStateAndEntities},
} = zustandNotNormalizedOptimized
