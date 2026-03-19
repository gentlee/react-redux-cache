import {withTypenames} from 'rrc'
import {initializeForReact} from 'rrc/react'
import {initializeForZustand} from 'rrc/zustand'
import {create} from 'zustand'

import {getUser, getUsers, removeUser, updateUser} from '../../backend/normalized/mocks'
import {Typenames} from '../../backend/normalized/types'

const cache = withTypenames<Typenames>().createCache({
  name: 'zustand-normalized',
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

export const {
  selectors: {selectEntitiesByTypename},
  utils: {getInitialState},
} = cache

const initialState = getInitialState()

export const useStore = create(() => initialState)

const originalSetState = useStore.setState
useStore.setState = (...args) => {
  console.debug('@zustand-normalized/setState', args)
  // @ts-expect-error TODO fix types
  originalSetState(...args)
}

export const zustandNormalized = {
  ...cache,
  ...initializeForZustand(cache, useStore),
  ...initializeForReact(cache),
}
