import {act, render as renderImpl, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {getUser, getUsers} from '../../testing/api/mocks'
import {generateTestEntitiesMap} from '../../testing/api/utils'
import {advanceApiTimeout, advanceHalfApiTimeout} from '../../testing/common'
import {setQueryStateAndEntities, useClient, useQuery} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'
import {defaultGetParamsKey, defaultQueryMutationState} from '../utilsAndConstants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: {query: any}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let refetch: any

let store: ReturnType<typeof createReduxStore>['store']
let rerender: ReturnType<typeof renderImpl>['rerender']
beforeEach(() => {
  store = createReduxStore(false, true).store

  // always use rerender instead of render
  ;({rerender} = renderImpl(<div />))
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
  const resultText = getResultText()

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
  const resultText = getResultText()
  await act(advanceApiTimeout)
  const resultTextAfterTimeout = getResultText()

  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2], page: 1}))
  expect(resultTextAfterTimeout).toBe(resultText)
  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)
}

test('no fetch on mount if has cache', setCacheAndMountAndCheckNoRefetch)

test('loads three pages sequentially', async () => {
  await setCacheAndMountAndCheckNoRefetch()

  act(() => {
    client.query({
      query: 'getUsers',
      params: {
        page: 2,
      },
    })
  })
  await act(advanceHalfApiTimeout)
  const loadingElementPage2 = getLoadingElement()
  await act(advanceApiTimeout)
  act(() => {
    client.query({
      query: 'getUsers',
      params: {
        page: 3,
      },
    })
  })
  await act(advanceHalfApiTimeout)
  const loadingElementPage3 = getLoadingElement()
  await act(advanceHalfApiTimeout)
  const resultText = getResultText()

  expect(loadingElementPage2).toBeTruthy()
  expect(loadingElementPage3).toBeTruthy()
  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2, 3, 4, 5, 6, 7, 8], page: 3}))
  expect(getUsers).toBeCalledTimes(2)
})

test.each(['getUser', 'getUserNoSelector'] as const)(
  'refetch on params change without cancelling current loading query, resultSelector keeps result undefined',
  async (query) => {
    render({
      query,
      params: 0,
    })
    await act(advanceApiTimeout)
    const firstUserResultJSON = getResultText()
    render({
      query,
      params: 1,
    })
    const loadingElement = getLoadingElement()
    render({
      query,
      params: 2,
    })
    const secondLoadingElement = getLoadingElement()
    await act(advanceApiTimeout)
    const latestUserResultJSON = getResultText()

    expect(loadingElement).toBeTruthy()
    expect(secondLoadingElement).toBeTruthy()
    expect(firstUserResultJSON).toBe(JSON.stringify(0))
    expect(latestUserResultJSON).toBe(JSON.stringify(2))
    expect(getUser).toBeCalledTimes(3)
    expect(store.getState()).toStrictEqual({
      entities: generateTestEntitiesMap(3),
      queries: {
        getUser: {},
        getUsers: {},
        getUserNoSelector: {},
        ...{
          [query]: {
            0: {
              ...defaultQueryMutationState,
              result: query === 'getUser' ? undefined : 0,
            },
            1: {
              ...defaultQueryMutationState,
              result: query === 'getUser' ? undefined : 1,
            },
            2: {
              ...defaultQueryMutationState,
              result: query === 'getUser' ? undefined : 2,
            },
          },
        },
      },
      mutations: {},
    })
  }
)

test('no refetch on params change with custom cache key', async () => {
  await setCacheAndMountAndCheckNoRefetch()

  render({
    query: 'getUsers',
    params: {page: 2},
  })
  const resultText = getResultText()
  await act(advanceApiTimeout)
  const resultTextAfterTimeout = getResultText()

  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2], page: 1}))
  expect(resultTextAfterTimeout).toBe(resultText)
  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)
})

test.each([
  {query: 'getUser', result: undefined},
  {query: 'getUserNoSelector', result: 1},
] as const)('fetch on mount having cache with cache-and-fetch policy', async ({query, result}) => {
  store.dispatch(
    setQueryStateAndEntities(
      query,
      defaultGetParamsKey(1),
      {
        result,
      },
      {
        merge: generateTestEntitiesMap(1),
      }
    )
  )

  render({
    query,
    cacheOptions: 'cache-and-fetch',
    params: 1,
  })

  const loadingElementWhileLoading = getLoadingElement()
  await act(advanceApiTimeout)
  const resultText = getResultText()

  expect(loadingElementWhileLoading).toBeTruthy()
  expect(resultText).toBe('1')
  expect(getUser).toBeCalledTimes(1)
})

test('fetch after params change with custom cache key if cache-and-fetch policy', async () => {
  render({
    query: 'getUsers',
    cacheOptions: 'cache-and-fetch',
    params: {page: 1},
  })
  await act(advanceApiTimeout)
  render({
    query: 'getUsers',
    cacheOptions: 'cache-and-fetch',
    params: {page: 2},
  })
  const loadingElementWhileLoading = getLoadingElement()
  await act(advanceApiTimeout)
  const resultText = getResultText()

  expect(loadingElementWhileLoading).toBeTruthy()
  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2, 3, 4, 5], page: 2}))
  expect(getUsers).toBeCalledTimes(2)
})

test.each(['getUser', 'getUserNoSelector'] as const)(
  'no fetch when skip, without cancelling current request when setting to true',
  async (query) => {
    render({
      query,
      skip: true,
      params: 0,
    })
    await act(advanceHalfApiTimeout)
    const dataText1 = getResultText()
    render({
      query,
      skip: true,
      params: 1,
    })
    await act(advanceHalfApiTimeout)
    const dataText2 = getResultText()
    render({
      query,
      params: 2,
    })
    await act(advanceHalfApiTimeout)
    const loading3 = getLoadingElement()
    render({
      query,
      skip: true,
      params: 2,
    })
    await act(advanceHalfApiTimeout)
    const dataText4 = getResultText()
    render({
      query,
      params: 3,
    })
    const loading5 = getLoadingElement()
    await act(advanceApiTimeout)
    const dataText5 = getResultText()
    render({
      query,
      skip: true,
      params: 2,
    })
    const dataText6 = getResultText()

    expect(getUser).toBeCalledTimes(2)
    expect(dataText1).toBe('')
    expect(dataText2).toBe('')
    expect(loading3).toBeTruthy()
    expect(dataText4).toBe(JSON.stringify(2))
    expect(loading5).toBeTruthy()
    expect(dataText5).toBe(JSON.stringify(3))
    expect(dataText6).toBe(JSON.stringify(2))
  }
)

test.each([
  {
    query: 'getUser',
    state: {
      getUser: {
        0: {
          result: undefined,
          loading: false,
          error: undefined,
        },
      },
    },
  },
  {
    query: 'getUserNoSelector',
    state: {
      getUserNoSelector: {
        0: {
          result: 0,
          loading: false,
          error: undefined,
        },
      },
    },
  },
] as const)('cancel manual refetch when currently loading same params', async ({query, state}) => {
  render({
    query,
    params: 0,
  })

  await act(advanceHalfApiTimeout)
  const loadingElement = getLoadingElement()
  await act(() => {
    refetch()
  })
  await act(advanceHalfApiTimeout)
  const data = getResultText()

  expect(loadingElement).toBeTruthy()
  expect(data).toBe(JSON.stringify(0))
  expect(getUser).toBeCalledTimes(1)
  expect(store.getState()).toStrictEqual({
    entities: generateTestEntitiesMap(1),
    queries: {
      getUser: {},
      getUsers: {},
      getUserNoSelector: {},
      ...state,
    },
    mutations: {},
  })
})

// components

const TestUseQueryComponent = ({options}: {options: Parameters<typeof useQuery>[0]}) => {
  client = useClient()

  const [{result, loading}, refetchImpl] = useQuery(options)
  refetch = refetchImpl

  return loading ? (
    <p data-testid="loading" />
  ) : (
    <p data-testid="result">{JSON.stringify(result)}</p>
  )
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

const getResultText = () => screen.getByTestId('result').innerHTML

const getUsersOnePageState = {
  entities: generateTestEntitiesMap(3),
  queries: {
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
    getUser: {},
    getUserNoSelector: {},
  },
  mutations: {},
}
