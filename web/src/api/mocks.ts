import { User, Bank } from "./types"

export const banks: Bank[] = [
  {
    staticId: '1',
    name: 'Bank 1'
  },
  {
    staticId: '2',
    name: 'Bank 2'
  }
]

export const users: User[] = [
  {
    id: 1,
    name: 'User 1',
    bank: banks[0],
  },
  {
    id: 2,
    name: 'User 2',
    bank: {
      staticId: '1',
    } as Bank,
  },
  {
    id: 3,
    name: 'User 3',
    bank: banks[1],
  }
]

export const usersJSON = JSON.stringify(users)
