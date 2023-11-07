import {apiTimeout} from '../common'
import {User} from './types'
import {generateTestBank, generateTestUser} from './utils'

export const getUser = async (id: number) => {
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
}

export const getUsers = async ({page = 1}: {page: number}) => {
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
}

export const removeUser = async (id: User['id']) => {
  await apiTimeout()
  return {
    remove: {
      users: [id],
    },
  }
}

export const updateUser = async (user: Partial<Omit<User, 'bank'>> & Pick<User, 'id'>) => {
  await apiTimeout()
  return {
    result: user.id,
    merge: {
      users: {
        [user.id]: user,
      },
    },
  }
}
