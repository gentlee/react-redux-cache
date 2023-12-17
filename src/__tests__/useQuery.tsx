import {act, render as renderImpl} from '@testing-library/react'
import React from 'react'
import {Provider} from 'react-redux'

import {getUser, getUsers} from '../testing/api/mocks'
import {assertEventLog, emptyState, generateTestEntitiesMap, logEvent} from '../testing/api/utils'
import {advanceApiTimeout, advanceHalfApiTimeout} from '../testing/common'
import {setQueryStateAndEntities, useClient, useQuery} from '../testing/redux/cache'
import {createReduxStore} from '../testing/redux/store'
import {defaultGetCacheKey, defaultQueryMutationState} from '../utilsAndConstants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: {query: any}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let refetch: any

let store: ReturnType<typeof createReduxStore>
let rerender: ReturnType<typeof renderImpl>['rerender']
beforeEach(() => {
  store = createReduxStore(false)

  // always use rerender instead of render
  ;({rerender} = renderImpl(<div />))
})

afterEach(() => {
  getUsers.mockClear()
  getUser.mockClear()
})

// tests

test('fetch if no cache', async () => {
  render({query: 'getUsers', params: {page: 1}})
  await act(advanceApiTimeout)
  assertEventLog([
    'render: undefined',
    'render: loading',
    'merge results: first page',
    'render: ' + JSON.stringify({items: [0, 1, 2], page: 1}),
  ])

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
      {merge: generateTestEntitiesMap(3)}
    )
  )

  render({
    query: 'getUsers',
    params: {page: 1},
  })
  await act(advanceApiTimeout)
  assertEventLog(['render: ' + JSON.stringify({items: [0, 1, 2], page: 1})])

  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)
}

test('no fetch on mount if has cache', setCacheAndMountAndCheckNoRefetch)

test('loads three pages sequentially', async () => {
  await setCacheAndMountAndCheckNoRefetch()

  act(() => {
    client.query({
      query: 'getUsers',
      params: {page: 2},
    })
  })
  await act(advanceApiTimeout)
  assertEventLog([
    'render: loading',
    'merge results: next page',
    'render: ' + JSON.stringify({items: [0, 1, 2, 3, 4, 5], page: 2}),
  ])

  act(() => {
    client.query({
      query: 'getUsers',
      params: {page: 3},
    })
  })
  await act(advanceApiTimeout)
  assertEventLog([
    'render: loading',
    'merge results: next page',
    'render: ' + JSON.stringify({items: [0, 1, 2, 3, 4, 5, 6, 7, 8], page: 3}),
  ])

  expect(getUsers).toBeCalledTimes(2)
})

test.each(['getUser', 'getUserNoSelector'] as const)(
  'should not cancel current loading query on refetch with different params, resultSelector keeps result undefined',
  async (query) => {
    render({query, params: 0})
    await act(advanceApiTimeout)
    assertEventLog(['render: undefined', 'render: loading', 'render: 0'])

    render({query, params: 1})
    assertEventLog(['render: undefined', 'render: loading'])

    render({query, params: 2})
    await act(advanceApiTimeout)
    assertEventLog(['render: undefined', 'render: loading', 'render: 2'])

    expect(getUser).toBeCalledTimes(3)
    expect(store.getState()).toStrictEqual({
      ...emptyState,
      entities: generateTestEntitiesMap(3),
      queries: {
        ...emptyState.queries,
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
    })
  }
)

test('no refetch on params change with custom cache key', async () => {
  await setCacheAndMountAndCheckNoRefetch()

  render({
    query: 'getUsers',
    params: {page: 2},
  })
  await act(advanceApiTimeout)
  assertEventLog(['render: ' + JSON.stringify({items: [0, 1, 2], page: 1})])

  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState()).toStrictEqual(getUsersOnePageState)
})

test.each([
  {query: 'getUser', result: undefined},
  {query: 'getUserNoSelector', result: 0},
] as const)('fetch on mount having cache with cache-and-fetch policy', async ({query, result}) => {
  store.dispatch(
    setQueryStateAndEntities(
      query,
      defaultGetCacheKey(0),
      {result},
      {merge: generateTestEntitiesMap(1)}
    )
  )

  render({query, params: 0, cachePolicy: 'cache-and-fetch'})
  await act(advanceApiTimeout)
  assertEventLog(['render: 0', 'render: loading', 'render: 0'])

  expect(getUser).toBeCalledTimes(1)
})

test.each(['cache-first', 'cache-and-fetch'] as const)(
  'no fetch after params change with custom cache key',
  async (cachePolicy) => {
    render({
      query: 'getUsers',
      cachePolicy,
      params: {page: 1},
    })
    await act(advanceApiTimeout)
    assertEventLog([
      'render: undefined',
      'render: loading',
      'merge results: first page',
      'render: ' + JSON.stringify({items: [0, 1, 2], page: 1}),
    ])

    render({
      query: 'getUsers',
      cachePolicy,
      params: {page: 2},
    })
    await act(advanceApiTimeout)
    assertEventLog(['render: ' + JSON.stringify({items: [0, 1, 2], page: 1})])

    expect(getUsers).toBeCalledTimes(1)
  }
)

test.each(['getUser', 'getUserNoSelector'] as const)(
  'no fetch when skip, without cancelling current request when setting to true',
  async (query) => {
    render({query, params: 0, skip: true})
    await act(advanceHalfApiTimeout)
    assertEventLog(['render: undefined'])

    render({query, params: 1, skip: true})
    await act(advanceHalfApiTimeout)
    assertEventLog(['render: undefined'])

    render({query, params: 2})
    await act(advanceHalfApiTimeout)
    assertEventLog(['render: undefined', 'render: loading'])

    render({query, params: 2, skip: true})
    await act(advanceHalfApiTimeout)
    assertEventLog(['render: loading', 'render: 2'])

    render({query, params: 3})
    await act(advanceApiTimeout)
    assertEventLog(['render: undefined', 'render: loading', 'render: 3'])

    render({query, params: 2, skip: true})
    assertEventLog(['render: 2'])

    expect(getUser).toBeCalledTimes(2)
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
  render({query, params: 0})

  await act(advanceHalfApiTimeout)
  await act(() => {
    refetch()
  })
  await act(advanceHalfApiTimeout)

  expect(getUser).toBeCalledTimes(1)
  expect(store.getState()).toStrictEqual({
    ...emptyState,
    entities: generateTestEntitiesMap(1),
    queries: {
      ...emptyState.queries,
      ...state,
    },
  })
  assertEventLog(['render: undefined', 'render: loading', 'render: 0'])
})

// components

const TestUseQueryComponent = ({options}: {options: Parameters<typeof useQuery>[0]}) => {
  client = useClient()

  const [{result, loading}, refetchImpl] = useQuery(options)
  refetch = refetchImpl

  logEvent(loading ? 'render: loading' : 'render: ' + JSON.stringify(result))

  return null
}

// utils

const render = (options: Parameters<typeof useQuery>[0]) => {
  return rerender(
    <Provider store={store}>
      <TestUseQueryComponent options={options} />
    </Provider>
  )
}

const getUsersOnePageState = {
  entities: generateTestEntitiesMap(3),
  queries: {
    ...emptyState.queries,
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
