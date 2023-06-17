export type User = {
  id: number,
  name: string,
  bank: Bank
}

export type Bank = {
  staticId: string,
  name: string,
}
