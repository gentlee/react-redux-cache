import {Cache, createCache} from 'react-redux-cache'

import {Bank} from '../normalized/api/types'
import {getUser, getUsers, removeUser, updateUser} from './api/mocks'
import {User} from './api/types'

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
  typenames: {
    users: {} as User,
    banks: {} as Bank,
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
    },
    removeUser: {
      mutation: removeUser,
    },
  },
})