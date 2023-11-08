import {act, render as renderImpl, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {getUser, getUsers} from '../../testing/api/mocks'
import {generateTestEntitiesMap} from '../../testing/api/utils'
import {advanceApiTimeout, advanceHalfApiTimeout} from '../../testing/common'
import {setQueryStateAndEntities, useQuery} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'
import {defaultQueryMutationState} from '../utilsAndConstants'

let store: ReturnType<typeof createReduxStore>['store']
let rerender: ReturnType<typeof renderImpl>['rerender']
beforeEach(() => {
  store = createReduxStore(false, false).store

  // always use rerender instead of render
  rerender = renderImpl(<div />).rerender
})

afterEach(() => {
  getUsers.mockClear()
  getUser.mockClear()
})

// tests

test('fetch if no cache', async () => {
  render({
    query: 'getUsers',
    params: {page: 1},
  })

  const loadingElementWhileLoading = getLoadingElement()
  await act(advanceApiTimeout)
  const resultText = await getDataText()

  expect(loadingElementWhileLoading).toBeTruthy()
  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2], page: 1}))
  expect(getUsers).toBeCalledTimes(1)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)
})

const setCacheAndMountAndCheckNoRefetch = async () => {
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

  render({
    query: 'getUsers',
    params: {page: 1},
  })
  const resultText = await getDataText()
  await act(advanceApiTimeout)
  const resultTextAfterTimeout = await getDataText()

  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2], page: 1}))
  expect(resultTextAfterTimeout).toBe(resultText)
  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)
}

test('no fetch if has cache', setCacheAndMountAndCheckNoRefetch)

test('refetch on params change without cancelling current loading query', async () => {
  render({
    query: 'getUser',
    params: 0,
  })
  await act(advanceApiTimeout)
  const firstUserResultJSON = await getDataText()
  render({
    query: 'getUser',
    params: 1,
  })
  const loadingElement = getLoadingElement()
  render({
    query: 'getUser',
    params: 2,
  })
  const secondLoadingElement = getLoadingElement()
  await act(advanceApiTimeout)
  const latestUserResultJSON = await getDataText()

  expect(loadingElement).toBeTruthy()
  expect(secondLoadingElement).toBeTruthy()
  expect(firstUserResultJSON).toBe(JSON.stringify(0))
  expect(latestUserResultJSON).toBe(JSON.stringify(2))
  expect(getUser).toBeCalledTimes(3)
  expect(store.getState()).toStrictEqual({
    entities: generateTestEntitiesMap(3),
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
        2: {
          ...defaultQueryMutationState,
          result: 2,
        },
      },
      getUsers: {},
    },
    mutations: {},
  })
})

test('no refetch on params change with custom cache key', async () => {
  await setCacheAndMountAndCheckNoRefetch()

  render({
    query: 'getUsers',
    params: {page: 2},
  })
  const resultText = await getDataText()
  await act(advanceApiTimeout)
  const resultTextAfterTimeout = await getDataText()

  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2], page: 1}))
  expect(resultTextAfterTimeout).toBe(resultText)
  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)
})

test('no fetch when skip, without cancelling current request when setting to true', async () => {
  render({
    query: 'getUser',
    skip: true,
    params: 0,
  })
  await act(advanceHalfApiTimeout)
  const dataText1 = await getDataText()
  render({
    query: 'getUser',
    skip: true,
    params: 1,
  })
  await act(advanceHalfApiTimeout)
  const dataText2 = await getDataText()
  render({
    query: 'getUser',
    params: 2,
  })
  await act(advanceHalfApiTimeout)
  const loading3 = getLoadingElement()
  render({
    query: 'getUser',
    skip: true,
    params: 2,
  })
  await act(advanceHalfApiTimeout)
  const dataText4 = await getDataText()
  render({
    query: 'getUser',
    params: 3,
  })
  const loading5 = getLoadingElement()
  await act(advanceApiTimeout)
  const dataText5 = await getDataText()

  expect(getUser).toBeCalledTimes(2)
  expect(dataText1).toBe('')
  expect(dataText2).toBe('')
  expect(loading3).toBeTruthy()
  expect(dataText4).toBe(JSON.stringify(2))
  expect(loading5).toBeTruthy()
  expect(dataText5).toBe(JSON.stringify(3))
})

// refresh manually while loading?
// resultSelector
// fetch next page

// components

const TestUseQueryComponent = ({options}: {options: Parameters<typeof useQuery>[0]}) => {
  const [{result, loading}] = useQuery(options)

  return loading ? <p data-testid="loading" /> : <p data-testid="data">{JSON.stringify(result)}</p>
}

// utils

const render = (options: Parameters<typeof useQuery>[0]) => {
  return rerender(
    <Provider store={store}>
      <TestUseQueryComponent options={options} />
    </Provider>
  )
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
