export type Typenames = {
  users: User
  banks: Bank
}

export type User = {
  id: number
  bankId: string
  name?: string
}

export type Bank = {
  id: string
  name: string
}
