import {Mutation, NormalizedMutation, NormalizedQuery} from '../../types'
import {TestTypenames} from '../redux/cache'
import {apiTimeout} from '../utils'
import {User} from './types'
import {generateTestBank, generateTestUser} from './utils'

export const getUser = jest.fn(async (id) => {
  await apiTimeout()
  return {
    result: id,
    merge: {
      users: {
        [id]: generateTestUser(id),
      },
      banks: {
        [id]: generateTestBank(String(id)),
      },
    },
  }
}) satisfies NormalizedQuery<TestTypenames, number>

export const getUsers = jest.fn(async ({page = 1}) => {
  const pageSize = 3
  const items = Array.from({length: pageSize}, (_, i) => pageSize * (page - 1) + i)
  await apiTimeout()
  return {
    result: {
      items,
      page,
    },
    merge: {
      users: {
        [items[0]]: generateTestUser(items[0]),
        [items[1]]: generateTestUser(items[1]),
        [items[2]]: generateTestUser(items[2]),
      },
      banks: {
        [items[0]]: generateTestBank(String(items[0])),
        [items[1]]: generateTestBank(String(items[1])),
        [items[2]]: generateTestBank(String(items[2])),
      },
    },
  }
}) satisfies NormalizedQuery<TestTypenames, {page: number}>

export const removeUser = jest.fn(async (id) => {
  await apiTimeout()
  return {
    remove: {
      users: [id],
    },
  }
}) satisfies NormalizedMutation<TestTypenames, User['id']>

export const updateUser = jest.fn(async (user) => {
  await apiTimeout()
  return {
    result: user.id,
    merge: {
      users: {
        [user.id]: user,
      },
    },
  }
}) satisfies NormalizedMutation<TestTypenames, Partial<Omit<User, 'bank'>> & Pick<User, 'id'>>

export const updateUserNotNormalized = jest.fn(async (user) => {
  await apiTimeout()
  return {
    result: user,
  }
}) satisfies Mutation<Partial<Omit<User, 'bank'>> & Pick<User, 'id'>>
