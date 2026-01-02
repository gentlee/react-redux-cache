import '@testing-library/jest-dom'

import {clearEventLog} from './api/utils'
import {testCaches} from './redux/cache'

jest.useFakeTimers()

// https://github.com/jsdom/jsdom/issues/3363#issuecomment-2283886610
global.structuredClone = (val) => {
  return JSON.parse(JSON.stringify(val))
}

afterEach(() => {
  clearEventLog()
})

afterAll(() => {
  for (const [_, testCache] of testCaches) {
    // @ts-expect-error it is private
    const abortControllers = testCache.cache.abortControllers

    expect(JSON.stringify(abortControllers)).toStrictEqual(JSON.stringify(new WeakMap()))
  }
})
