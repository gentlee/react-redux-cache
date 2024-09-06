import {apiTimeout} from '../../normalized/api/utils'
import {User} from './types'
import {generateUser} from './utils'

export const getUser = async (id: number) => {
  await apiTimeout()
  return {
    result: generateUser(id),
  }
}

export const getUsers = async ({page = 1}: {page: number}) => {
  const pageSize = 3
  const items = Array.from({length: pageSize}, (_, i) => {
    const id = pageSize * (page - 1) + i
    return generateUser(id)
  })
  await apiTimeout()
  return {
    result: {
      items,
      page,
    },
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const removeUser = async (id: User['id']) => {
  await apiTimeout()
  return {}
}

export const updateUser = async (user: Partial<Omit<User, 'bank'>> & Pick<User, 'id'>) => {
  await apiTimeout()
  return {
    result: user,
  }
}
