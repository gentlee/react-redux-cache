import {Mutation, Query} from 'react-redux-cache'

import {apiTimeout} from '../../normalized/api/utils'
import {User} from './types'
import {generateUser} from './utils'

export const getUser = (async (id: number) => {
  await apiTimeout()
  return {
    result: getUserFromBackend(id),
  }
}) satisfies Query<number>

export const getUsers = (async ({page = 1}: {page: number}) => {
  const pageSize = 3
  const items = Array.from({length: pageSize}, (_, i) => {
    const id = pageSize * (page - 1) + i
    return getUserFromBackend(id)
  })
  await apiTimeout()
  return {
    result: {
      items,
      page,
    },
  }
}) satisfies Query<{page: number}>

export const removeUser = (async (id) => {
  await apiTimeout()
  delete backendStorage.users[id]
  return {}
}) satisfies Mutation<User['id']>

export const updateUser = (async (user) => {
  await apiTimeout()
  backendStorage.users[user.id] = Object.assign(getUserFromBackend(user.id), user)
  return {
    result: getUserFromBackend(user.id),
  }
}) satisfies Mutation<Partial<Omit<User, 'bank'>> & Pick<User, 'id'>>

// backend storage mock

const backendStorage: {
  users: Record<string, User>
} = {
  users: {},
}

const getUserFromBackend = (id: number) => {
  backendStorage.users[id] ??= generateUser(id)
  return structuredClone(backendStorage.users[id])
}
