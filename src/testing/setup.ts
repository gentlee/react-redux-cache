import '@testing-library/jest-dom'

import {clearEventLog} from './api/utils'
import {testCaches} from './redux/cache'

export const consoleWarnSpy = jest.spyOn(console, 'warn')

jest.useFakeTimers()

afterEach(() => {
  clearEventLog()
  consoleWarnSpy.mockClear()
})

afterAll(() => {
  for (const [_, testCache] of testCaches) {
    const abortControllers = testCache.abortControllers

    expect(JSON.stringify(abortControllers)).toStrictEqual(JSON.stringify(new WeakMap()))
  }
})
