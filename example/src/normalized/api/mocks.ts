import {User} from './types'
import {apiTimeout, generateBank, generateUser} from './utils'

export const getUser = async (id: number) => {
  await apiTimeout()
  return {
    result: id,
    merge: {
      users: {
        [id]: generateUser(id),
      },
      banks: {
        [id]: generateBank(String(id)),
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
        [items[0]]: generateUser(items[0]),
        [items[1]]: generateUser(items[1]),
        [items[2]]: generateUser(items[2]),
      },
      banks: {
        [items[0]]: generateBank(String(items[0])),
        [items[1]]: generateBank(String(items[1])),
        [items[2]]: generateBank(String(items[2])),
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
