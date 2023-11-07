/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom'

import {act, render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {advanceApiTimeout} from '../test-utils/common'
import {useQuery} from '../test-utils/redux/cache'
import {createReduxStore} from '../test-utils/redux/store'

jest.useFakeTimers()

beforeEach(() => {
  global.console.debug = jest.fn()
})

// tests

test('fetch if no cache', async () => {
  const store = createReduxStore(false, false).store
  const options = {
    query: 'getUsers',
    params: {page: 1},
  } as const

  render(
    <Provider store={store}>
      <TestUseQueryComponent options={options} />
    </Provider>
  )

  const loadingElement = screen.getByTestId('loading')

  await act(advanceApiTimeout)

  const resultText = (await screen.findByTestId('data')).innerHTML

  expect(loadingElement).toBeTruthy()
  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2], page: 1}))
})

// components

const TestUseQueryComponent = ({options}: {options: Parameters<typeof useQuery>[0]}) => {
  const [{result, loading}] = useQuery(options)

  return loading ? <p data-testid="loading" /> : <p data-testid="data">{JSON.stringify(result)}</p>
}
