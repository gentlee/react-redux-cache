import {apiTimeout} from '../../normalized/api/utils'
import {User} from './types'
import {generateUser} from './utils'

export const getUser = async (id: number) => {
  await apiTimeout()
  return {
    result: getUserFromBackend(id),
  }
}

export const getUsers = async ({page = 1}: {page: number}) => {
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
}

export const removeUser = async (id: User['id']) => {
  await apiTimeout()
  delete backendStorage.users[id]
  return {}
}

export const updateUser = async (user: Partial<Omit<User, 'bank'>> & Pick<User, 'id'>) => {
  await apiTimeout()
  backendStorage.users[user.id] = Object.assign(getUserFromBackend(user.id), user)
  return {
    result: getUserFromBackend(user.id),
  }
}

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
