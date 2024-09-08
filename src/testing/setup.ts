import '@testing-library/jest-dom'

import {clearEventLog} from './api/utils'
import {cache} from './redux/cache'

jest.useFakeTimers()

afterEach(() => {
  clearEventLog()
})

afterAll(() => {
  // @ts-expect-error it is private
  const abortControllers = cache.abortControllers

  expect(JSON.stringify(abortControllers)).toStrictEqual(JSON.stringify(new WeakMap()))
})
