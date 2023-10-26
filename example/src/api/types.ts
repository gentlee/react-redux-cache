export type DenormalizedUser = Omit<User, 'bank'> & {bank: Bank}

export type User = {
  id: number
  name: string
  bank: string
}

export type Bank = {
  staticId: string
  name: string
}
