import {Bank} from '../../normalized/api/types'

export type User = {
  id: number
  bank: Bank
  name?: string
}
