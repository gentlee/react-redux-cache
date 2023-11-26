import {act, render as renderImpl, screen} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {getUser, getUsers} from '../../testing/api/mocks'
import {generateTestEntitiesMap} from '../../testing/api/utils'
import {advanceApiTimeout, advanceHalfApiTimeout} from '../../testing/common'
import {setQueryStateAndEntities, useClient, useQuery} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'
import {defaultQueryMutationState} from '../utilsAndConstants'

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
  const resultText = getDataText()

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
  const resultText = getDataText()
  await act(advanceApiTimeout)
  const resultTextAfterTimeout = getDataText()

  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2], page: 1}))
  expect(resultTextAfterTimeout).toBe(resultText)
  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)
}

test('no fetch if has cache', setCacheAndMountAndCheckNoRefetch)

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
  const loadingElementPage2 = await findLoadingElement()
  await act(advanceApiTimeout)
  act(() => {
    client.query({
      query: 'getUsers',
      params: {
        page: 3,
      },
    })
  })
  const loadingElementPage3 = await findLoadingElement()
  await act(advanceApiTimeout)
  const resultText = getDataText()

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
    const firstUserResultJSON = getDataText()
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
    const latestUserResultJSON = getDataText()

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
  const resultText = getDataText()
  await act(advanceApiTimeout)
  const resultTextAfterTimeout = getDataText()

  expect(resultText).toBe(JSON.stringify({items: [0, 1, 2], page: 1}))
  expect(resultTextAfterTimeout).toBe(resultText)
  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)
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
    const dataText1 = getDataText()
    render({
      query,
      skip: true,
      params: 1,
    })
    await act(advanceHalfApiTimeout)
    const dataText2 = getDataText()
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
    const dataText4 = getDataText()
    render({
      query,
      params: 3,
    })
    const loading5 = getLoadingElement()
    await act(advanceApiTimeout)
    const dataText5 = getDataText()
    render({
      query,
      skip: true,
      params: 2,
    })
    const dataText6 = getDataText()

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
  await act(() => refetch())
  await act(advanceHalfApiTimeout)

  const data = getDataText()

  expect(data).toBe(JSON.stringify(0))
  expect(getUser).toBeCalledTimes(1)
  expect(store.getState()).toStrictEqual({
    entities: generateTestEntitiesMap(1),
    queries: {
      // @ts-ignore
      getUser: {},
      getUsers: {},
      // @ts-ignore
      getUserNoSelector: {},
      ...state,
    },
    mutations: {},
  })
})

// fetch next page
// refresh pagination manually while loading next page?
// fetch policies

// components

const TestUseQueryComponent = ({options}: {options: Parameters<typeof useQuery>[0]}) => {
  client = useClient()

  const [{result, loading}, refetchImpl] = useQuery(options)
  refetch = refetchImpl

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

const findLoadingElement = () => screen.findByTestId('loading')

const getDataText = () => screen.getByTestId('data').innerHTML

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
