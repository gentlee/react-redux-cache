/**
 * @jest-environment jsdom
 */
jest.useFakeTimers()
global.console.debug = jest.fn()

afterEach(() => {
  getUsers.mockClear()
})

import '@testing-library/jest-dom'

import {act, render, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {getUser, getUsers} from '../test-utils/api/mocks'
import {generateTestEntitiesMap} from '../test-utils/api/utils'
import {advanceApiTimeout} from '../test-utils/common'
import {setQueryStateAndEntities, useQuery} from '../test-utils/redux/cache'
import {createReduxStore} from '../test-utils/redux/store'
import {defaultQueryMutationState} from '../utilsAndConstants'

// tests

test('fetch if no cache', async () => {
  const store = createStore()

  render(
    <Provider store={store}>
      <TestUseQueryComponent
        options={{
          query: 'getUsers',
          params: {page: 1},
        }}
      />
    </Provider>
  )

  const loadingElementWhileLoading = getLoadingElement()

  await act(advanceApiTimeout)

  const resultText = await getDataText()

  expect(loadingElementWhileLoading).toBeTruthy()
  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2], page: 1}))
  expect(getUsers).toBeCalledTimes(1)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)
})

const setCacheAndMountAndCheckNoRefetch = async () => {
  const store = createStore()
  store.dispatch(
    setQueryStateAndEntities(
      'getUsers',
      'all-pages',
      {
        result: {items: [0, 1, 2], page: 1},
        error: undefined,
        loading: false,
      },
      {
        merge: generateTestEntitiesMap(3),
      }
    )
  )

  const {rerender} = render(
    <Provider store={store}>
      <TestUseQueryComponent
        options={{
          query: 'getUsers',
          params: {page: 1},
        }}
      />
    </Provider>
  )

  const resultText = await getDataText()

  await act(advanceApiTimeout)

  const resultTextAfterTimeout = await getDataText()

  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2], page: 1}))
  expect(resultTextAfterTimeout).toBe(resultText)
  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)

  return {store, rerender}
}

test('no fetch if has cache', setCacheAndMountAndCheckNoRefetch)

test('refetch on params change', async () => {
  const store = createStore()

  const {rerender} = render(
    <Provider store={store}>
      <TestUseQueryComponent
        options={{
          query: 'getUser',
          params: 0,
        }}
      />
    </Provider>
  )

  await act(advanceApiTimeout)

  const firstUserResultJSON = await getDataText()

  rerender(
    <Provider store={store}>
      <TestUseQueryComponent
        options={{
          query: 'getUser',
          params: 1,
        }}
      />
    </Provider>
  )

  const loadingElement = getLoadingElement()

  await act(advanceApiTimeout)

  const secondUserResultJSON = await getDataText()

  expect(firstUserResultJSON).toBe(JSON.stringify(0))
  expect(secondUserResultJSON).toBe(JSON.stringify(1))
  expect(loadingElement).toBeTruthy()
  expect(getUser).toBeCalledTimes(2)
  expect(store.getState()).toStrictEqual({
    entities: generateTestEntitiesMap(2),
    queries: {
      getUser: {
        0: {
          ...defaultQueryMutationState,
          result: 0,
        },
        1: {
          ...defaultQueryMutationState,
          result: 1,
        },
      },
      getUsers: {},
    },
    mutations: {},
  })
})

test('no refetch on params change with custom cache key', async () => {
  const {store, rerender} = await setCacheAndMountAndCheckNoRefetch()

  rerender(
    <Provider store={store}>
      <TestUseQueryComponent
        options={{
          query: 'getUsers',
          params: {page: 2},
        }}
      />
    </Provider>
  )

  const resultText = await getDataText()

  await act(advanceApiTimeout)

  const resultTextAfterTimeout = await getDataText()

  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2], page: 1}))
  expect(resultTextAfterTimeout).toBe(resultText)
  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)
})

// refetch on params change when loading?
// refresh manually while loading?
// skip
// resultSelector
// fetch next page

// components

const TestUseQueryComponent = ({options}: {options: Parameters<typeof useQuery>[0]}) => {
  const [{result, loading}] = useQuery(options)

  return loading ? <p data-testid="loading" /> : <p data-testid="data">{JSON.stringify(result)}</p>
}

// utils

const createStore = () => {
  return createReduxStore(false, false).store
}

const getLoadingElement = () => screen.getByTestId('loading')

const getDataText = async () => (await screen.findByTestId('data')).innerHTML

const getUsersOnePageState = {
  entities: generateTestEntitiesMap(3),
  queries: {
    getUser: {},
    getUsers: {
      'all-pages': {
        result: {
          items: [0, 1, 2],
          page: 1,
        },
        loading: false,
        error: undefined,
      },
    },
  },
  mutations: {},
}

// const getUsersTwoPageState = {
//   entities: generateTestEntitiesMap(6),
//   queries: {
//     getUser: {},
//     getUsers: {
//       'all-pages': {
//         result: {
//           items: [0, 1, 2, 3, 4, 5],
//           page: 2,
//         },
//         loading: false,
//         error: undefined,
//       },
//     },
//   },
//   mutations: {},
// }
