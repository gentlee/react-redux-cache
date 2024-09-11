import {Cache, createCache, defaultGetCacheKey} from 'react-redux-cache'

import {getUser, getUsers, removeUser, updateUser} from '../not-normalized/api/mocks'

export type Typenames = typeof cacheNotNormalized extends Cache<
  string,
  infer T,
  unknown,
  unknown,
  unknown,
  unknown
>
  ? T
  : never

export const cacheNotNormalized = createCache({
  name: 'cacheNotNormalized',
  typenames: {}, // without normalization we don't need typenames
  queries: {
    getUsers: {
      query: getUsers,
      getCacheKey: () => 'all-pages',
      mergeResults: (oldResult, {result: newResult}, _, store) => {
        // we set getUser query results to prevent them from loading when UserScreen is opened for the first time
        const updateGetUserResults = () => {
          newResult.items.forEach((user) => {
            store.dispatch(
              cacheNotNormalized.actions.updateQueryStateAndEntities('getUser', defaultGetCacheKey(user.id), {
                result: user,
                params: user.id,
              })
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
