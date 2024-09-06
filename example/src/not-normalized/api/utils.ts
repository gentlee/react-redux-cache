import {generateBank} from '../../normalized/api/utils'
import {User} from './types'

export const generateUser = (id: number, full = true, nameSuffix = ''): User => {
  const user: User = {
    id,
    bank: generateBank(String(id)),
  }
  if (full) {
    user.name = `User ${id}` + nameSuffix
  }
  return user
}
