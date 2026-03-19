import {Bank} from '../normalized/types'

export type User = {
  id: number
  bank: Bank
  name?: string
}
