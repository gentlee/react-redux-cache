import {NormalizedMutation, NormalizedQuery} from 'react-redux-cache'

import {Typenames} from '../cache'
import {Bank, User} from './types'
import {apiTimeout, generateBank, generateUser} from './utils'

export const getUser = (async (id: number) => {
  await apiTimeout()
  return {
    result: id,
    merge: {
      users: {
        [id]: getUserFromBackend(id),
      },
      banks: {
        [id]: getBankFromBackend(String(id)),
      },
    },
  }
}) satisfies NormalizedQuery<Typenames, number>

export const getUsers = (async ({page = 1}) => {
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
        [items[0]]: getUserFromBackend(items[0]),
        [items[1]]: getUserFromBackend(items[1]),
        [items[2]]: getUserFromBackend(items[2]),
      },
      banks: {
        [items[0]]: getBankFromBackend(String(items[0])),
        [items[1]]: getBankFromBackend(String(items[1])),
        [items[2]]: getBankFromBackend(String(items[2])),
      },
    },
  }
}) satisfies NormalizedQuery<Typenames, {page: number}>

export const removeUser = (async (id) => {
  await apiTimeout()
  delete backendStorage.users[id]
  return {
    remove: {
      users: [id],
    },
  }
}) satisfies NormalizedMutation<Typenames, User['id']>

export const updateUser = (async (user) => {
  await apiTimeout()
  backendStorage.users[user.id] = Object.assign(backendStorage.users[user.id], user)
  return {
    result: user.id,
    merge: {
      users: {
        [user.id]: user,
      },
    },
  }
}) satisfies NormalizedMutation<Typenames, Partial<Omit<User, 'bank'>> & Pick<User, 'id'>>

// backend storage mock

const backendStorage: {
  users: Record<string, User>
  banks: Record<string, Bank>
} = {
  users: {},
  banks: {},
}

const getUserFromBackend = (id: number) => {
  backendStorage.users[id] ??= generateUser(id)
  return structuredClone(backendStorage.users[id])
}

const getBankFromBackend = (id: string) => {
  backendStorage.banks[id] ??= generateBank(id)
  return structuredClone(backendStorage.banks[id])
}
