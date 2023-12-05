import '@testing-library/jest-dom'

import {abortControllers} from '../src/mutate'
import {clearEventLog} from './api/utils'

jest.useFakeTimers()

afterEach(() => {
  clearEventLog()
})

afterAll(() => {
  expect(JSON.stringify(abortControllers)).toEqual(JSON.stringify(new WeakMap()))
})
