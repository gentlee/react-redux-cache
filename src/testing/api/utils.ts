import {EntitiesMap} from '../..'
import {TestTypenames} from '../redux/cache'
import {createReduxStore} from '../redux/store'
import {Bank, User} from './types'

// event log

const eventLog: string[] = []

export const logEvent = (event: string) => {
  eventLog.push(event)
}

export const assertEventLog = (log: string[]) => {
  expect(eventLog).toEqual(log)
  clearEventLog()
}

export const clearEventLog = () => (eventLog.length = 0)

// mocks

export const emptyState = createReduxStore(false).getState()

export const generateTestUser = (id: number, full = true, nameSuffix = ''): User => {
  const user: User = {
    id,
    bankId: String(id),
  }
  if (full) {
    user.name = `User ${id}` + nameSuffix
  }
  return user
}

export const generateTestBank = (id: string, nameSuffix = ''): Bank => {
  return {
    id,
    name: 'Bank ' + id + nameSuffix,
  }
}

export const generateTestEntitiesMap = (size: number, full = true): EntitiesMap<TestTypenames> => {
  const users = Array.from({length: size}, (_, i) => generateTestUser(i, full))
  const banks = Array.from({length: size}, (_, i) => generateTestBank(String(i)))

  return {
    users: mapFromArray(users, 'id'),
    banks: mapFromArray(banks, 'id'),
  }
}

// other utils

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mapFromArray = <T extends Record<string, any>, K extends keyof T>(
  array: T[],
  key: K
): Record<string, T> => {
  return array.reduce((acc, item) => {
    acc[item[key]] = item
    return acc
  }, {} as Record<string, T>)
}
