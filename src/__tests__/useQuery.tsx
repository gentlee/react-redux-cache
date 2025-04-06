import {act, render as renderImpl} from '@testing-library/react'
import React, {Key, useRef} from 'react'
import {Provider} from 'react-redux'

import {getUser, getUsers} from '../testing/api/mocks'
import {assertEventLog, clearEventLog, generateTestEntitiesMap, logEvent} from '../testing/api/utils'
import {EMPTY_STATE} from '../testing/constants'
import {GET_USERS_ONE_PAGE_STATE} from '../testing/constants'
import {
  actions,
  cache,
  clearCache,
  invalidateQuery,
  mergeEntityChanges,
  selectCacheState,
  selectEntityById,
  selectors,
  selectQueryError,
  selectQueryExpiresAt,
  selectQueryLoading,
  selectQueryParams,
  selectQueryResult,
  selectQueryState,
  updateQueryStateAndEntities,
  useClient,
  useQuery,
} from '../testing/redux/cache'
import {createReduxStore} from '../testing/redux/store'
import {advanceApiTimeout, advanceHalfApiTimeout, TTL_TIMEOUT} from '../testing/utils'
import {defaultGetCacheKey, FetchPolicy} from '../utilsAndConstants'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: {query: any}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let refetch: any

const store = createReduxStore(false)
let rerender: ReturnType<typeof renderImpl>['rerender']
beforeEach(() => {
  // always use rerender instead of render
  ;({rerender} = renderImpl(<div />))
})

afterEach(() => {
  store.dispatch(clearCache())
  expect(selectCacheState(store.getState())).toStrictEqual(EMPTY_STATE)

  getUsers.mockClear()
  getUser.mockClear()
})

// tests

test('fetch if no cache, success callbacks work', async () => {
  render({
    query: 'getUsers',
    params: {page: 1},
    onSuccess(response, params) {
      // @ts-expect-error page
      logEvent('onSuccess result:' + response.result.page + ' params:' + params.page)
    },
    onCompleted(response, error, params) {
      // @ts-expect-error page
      logEvent('onCompleted result:' + response?.result.page + ' params:' + params.page + ' error:' + error)
    },
    onError(error, params) {
      // @ts-expect-error page
      logEvent('onError params:' + params.page + ' error:' + error)
    },
  })
  await act(advanceApiTimeout)
  assertEventLog([
    'first render: undefined',
    'render: loading',
    'merge results: first page',
    'onSuccess result:1 params:1',
    'onCompleted result:1 params:1 error:undefined',
    'render: ' + JSON.stringify({items: [0, 1, 2], page: 1}),
  ])

  expect(getUsers).toBeCalledTimes(1)
  expect(store.getState().cache).toStrictEqual(GET_USERS_ONE_PAGE_STATE)
})

const setCacheAndMountAndCheckNoRefetch = async () => {
  store.dispatch(
    updateQueryStateAndEntities(
      'getUsers',
      'feed',
      {
        result: {items: [0, 1, 2], page: 1},
        error: undefined,
        params: {page: 1},
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
  assertEventLog(['first render: ' + JSON.stringify({items: [0, 1, 2], page: 1})])

  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState().cache).toStrictEqual(GET_USERS_ONE_PAGE_STATE)
}

test('no fetch on mount if has cache', setCacheAndMountAndCheckNoRefetch)

test('loads three pages sequentially with useQuery, refetch and client; query selectors work', async () => {
  await setCacheAndMountAndCheckNoRefetch()

  act(() => {
    refetch({
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
  const finalState = {items: [0, 1, 2, 3, 4, 5, 6, 7, 8], page: 3}
  assertEventLog(['render: loading', 'merge results: next page', 'render: ' + JSON.stringify(finalState)])

  expect(getUsers).toBeCalledTimes(2)
  expect(selectQueryState(store.getState(), 'getUsers', 'feed')).toStrictEqual({
    result: finalState,
    params: {page: 3},
  })
  expect(selectQueryResult(store.getState(), 'getUsers', 'feed')).toStrictEqual(finalState)
  expect(selectQueryLoading(store.getState(), 'getUsers', 'feed')).toStrictEqual(false)
  expect(selectQueryError(store.getState(), 'getUsers', 'feed')).toStrictEqual(undefined)
  expect(selectQueryParams(store.getState(), 'getUsers', 'feed')).toStrictEqual({page: 3})
})

test('should not cancel current loading query on refetch with different params', async () => {
  render({query: 'getUser', params: 0})
  await act(advanceApiTimeout)
  assertEventLog(['first render: undefined', 'render: loading', 'render: 0'])

  render({query: 'getUser', params: 1})
  assertEventLog(['render: undefined', 'render: loading'])

  render({query: 'getUser', params: 2})
  await act(advanceApiTimeout)
  assertEventLog(['render: undefined', 'render: loading', 'render: 2'])

  expect(getUser).toBeCalledTimes(3)
  expect(store.getState().cache).toStrictEqual({
    ...EMPTY_STATE,
    entities: generateTestEntitiesMap(3),
    queries: {
      ...EMPTY_STATE.queries,
      ...{
        getUser: {
          0: {
            result: 0,
            params: 0,
          },
          1: {
            result: 1,
            params: 1,
          },
          2: {
            result: 2,
            params: 2,
          },
        },
      },
    },
  })
})

test('no refetch on params change with custom cache key', async () => {
  await setCacheAndMountAndCheckNoRefetch()

  render({
    query: 'getUsers',
    params: {page: 2},
  })
  await act(advanceApiTimeout)
  assertEventLog(['render: ' + JSON.stringify({items: [0, 1, 2], page: 1})])

  expect(getUsers).toBeCalledTimes(0)
  expect(store.getState().cache).toStrictEqual(GET_USERS_ONE_PAGE_STATE)
})

test('fetch on mount having cache with FetchPolicy.Always', async () => {
  store.dispatch(
    updateQueryStateAndEntities(
      'getUser',
      defaultGetCacheKey(0),
      {result: 0},
      {merge: generateTestEntitiesMap(1)}
    )
  )

  render({query: 'getUser', params: 0, fetchPolicy: FetchPolicy.Always})
  await act(advanceApiTimeout)
  assertEventLog(['first render: 0', 'render: loading', 'render: 0'])

  expect(getUser).toBeCalledTimes(1)
})

test.each([FetchPolicy.NoCacheOrExpired, FetchPolicy.Always] as const)(
  'no fetch after params change with custom cache key',
  async (fetchPolicy) => {
    render({
      query: 'getUsers',
      fetchPolicy,
      params: {page: 1},
    })
    await act(advanceApiTimeout)
    assertEventLog([
      'first render: undefined',
      'render: loading',
      'merge results: first page',
      'render: ' + JSON.stringify({items: [0, 1, 2], page: 1}),
    ])

    render({
      query: 'getUsers',
      fetchPolicy,
      params: {page: 2},
    })
    await act(advanceApiTimeout)
    assertEventLog(['render: ' + JSON.stringify({items: [0, 1, 2], page: 1})])

    expect(getUsers).toBeCalledTimes(1)
  }
)

test('no fetch when skip, without cancelling current request when setting to true', async () => {
  render({query: 'getUser', params: 0, skipFetch: true})
  await act(advanceHalfApiTimeout)
  assertEventLog(['first render: undefined'])

  render({query: 'getUser', params: 1, skipFetch: true})
  await act(advanceHalfApiTimeout)
  assertEventLog(['render: undefined'])

  render({query: 'getUser', params: 2})
  await act(advanceHalfApiTimeout)
  assertEventLog(['render: undefined', 'render: loading'])

  render({query: 'getUser', params: 2, skipFetch: true})
  await act(advanceHalfApiTimeout)
  assertEventLog(['render: loading', 'render: 2'])

  render({query: 'getUser', params: 3})
  await act(advanceApiTimeout)
  assertEventLog(['render: undefined', 'render: loading', 'render: 3'])

  render({query: 'getUser', params: 2, skipFetch: true})
  assertEventLog(['render: 2'])

  expect(getUser).toBeCalledTimes(2)
})

test('cancel manual refetch when currently loading same params', async () => {
  render({query: 'getUser', params: 0})

  let shouldBeCancelledResult
  let refetchResult
  await act(advanceHalfApiTimeout)
  await act(() => {
    refetch().then((x: unknown) => (shouldBeCancelledResult = x)) // should be cancelled because fetch already in progress
  })
  await act(advanceHalfApiTimeout) // first fetch finishes here
  await act(() => {
    refetch().then((x: unknown) => (refetchResult = x)) // this refetch should work
  })
  await act(advanceApiTimeout)

  expect(getUser).toBeCalledTimes(2)
  expect(store.getState().cache).toStrictEqual({
    ...EMPTY_STATE,
    entities: generateTestEntitiesMap(1),
    queries: {
      ...EMPTY_STATE.queries,
      ...{
        getUser: {
          0: {
            result: 0,
            params: 0,
          },
        },
      },
    },
  })
  expect(shouldBeCancelledResult).toStrictEqual({cancelled: true})
  expect(refetchResult).toStrictEqual({result: 0})
  assertEventLog(['first render: undefined', 'render: loading', 'render: 0', 'render: loading', 'render: 0'])
})

// skipping if deep comparison disabled
;(cache.options.deepComparisonEnabled ? test : test.skip)('deep comparison opimizes re-renders', async () => {
  render({
    query: 'getUser',
    params: 0,
  })

  await act(advanceApiTimeout)

  assertEventLog(['first render: undefined', 'render: loading', 'render: 0'])

  // this act should not cause re-render
  act(() =>
    store.dispatch(
      updateQueryStateAndEntities(
        'getUser',
        0,
        {
          result: 0,
          params: 0,
          loading: false,
        },
        {
          merge: generateTestEntitiesMap(1),
        }
      )
    )
  )

  assertEventLog([])
})

test('secondsToLive, onlyIfExpired', async () => {
  render({query: 'getUserTtl', params: 0})
  await act(advanceApiTimeout)
  assertEventLog(['first render: undefined', 'render: loading', 'render: 0'])
  expect(selectQueryExpiresAt(store.getState(), 'getUserTtl', 0)).toStrictEqual(Date.now() + TTL_TIMEOUT)

  act(() => {
    refetch({onlyIfExpired: true}) // onlyIfExpired should not cause fetch
  })
  assertEventLog([])
  expect(getUser).toBeCalledTimes(1)

  render({query: 'getUserTtl', params: 0}, 'second-mount') // here query is not expired yet
  assertEventLog(['first render: 0'])
  expect(getUser).toBeCalledTimes(1)

  await act(() => jest.advanceTimersByTimeAsync(TTL_TIMEOUT)) // here query expires and next mount should cause new fetch

  render({query: 'getUserTtl', params: 0}, 'second-mount') // re-render does not cause refetch even if expired
  assertEventLog(['render: 0'])

  render({query: 'getUserTtl', params: 0}, 'third-mount') // mount causes refetch if expired
  await act(advanceApiTimeout)
  assertEventLog(['first render: 0', 'render: loading', 'render: 0'])
  expect(getUser).toBeCalledTimes(2)
  expect(store.getState().cache).toStrictEqual({
    ...EMPTY_STATE,
    entities: generateTestEntitiesMap(1),
    queries: {
      ...EMPTY_STATE.queries,
      ...{
        getUserTtl: {
          0: {
            expiresAt: Date.now() + TTL_TIMEOUT,
            result: 0,
            params: 0,
          },
        },
      },
    },
  })
})

test('no re-render on expiresAt change', async () => {
  render({query: 'getUserTtl', params: 0})
  await act(advanceApiTimeout)
  clearEventLog()

  act(() => store.dispatch(invalidateQuery([{query: 'getUserTtl', expiresAt: Date.now() + 1000}])))
  assertEventLog([]) // update of expiresAt should not cause re-render
})

test('expiresAt from query response works and overrides sedondsToLive', async () => {
  render({query: 'getUserExpires', params: 0})
  await act(advanceApiTimeout)

  expect(selectQueryExpiresAt(store.getState(), 'getUserExpires', 0)).toBe(Date.now() + TTL_TIMEOUT)

  act(() => {
    refetch({secondsToLive: 1}) // sedondsToLive should be ignored
  })
  await act(advanceApiTimeout)

  expect(selectQueryExpiresAt(store.getState(), 'getUserExpires', 0)).toBe(Date.now() + TTL_TIMEOUT)
})

test('custom fetch policy - enitity is not full or expired', async () => {
  store.dispatch(mergeEntityChanges({merge: {users: {[0]: {id: 0}}}})) // merge not full user

  render({query: 'getFullUser', params: 0}) // should fetch bcs user is not full
  await act(advanceApiTimeout)
  assertEventLog(['first render: undefined', 'render: loading', 'render: 0'])

  render({query: 'getFullUser', params: 0}, 'second-mount') // should not fetch, user is full
  await act(advanceApiTimeout)
  assertEventLog(['first render: 0'])

  expect(selectEntityById(store.getState(), 0, 'users')).toStrictEqual({id: 0, name: 'User 0', bankId: '0'})
})

test('handles errors', async () => {
  render({query: 'queryWithError', params: undefined}) // should fetch bcs user is not full

  await act(advanceApiTimeout)
  assertEventLog(['first render: undefined', 'render: loading', 'error: Test error'])

  expect(selectQueryError(store.getState(), 'queryWithError', 'undefined')).toHaveProperty(
    'message',
    'Test error'
  )
  expect(cache.globals.onError).toBeCalledWith(
    new Error('Test error'),
    'queryWithError',
    undefined,
    store,
    actions,
    selectors
  )
})

// components

const TestUseQueryComponent = ({options}: {options: Parameters<typeof useQuery>[0]}) => {
  client = useClient()
  const firstMountRef = useRef(true)

  const [{result, error, loading}, refetchImpl] = useQuery(options)
  refetch = refetchImpl

  logEvent(
    (firstMountRef.current ? 'first ' : '') +
      (loading ? 'render: loading' : error ? 'error: ' + error.message : 'render: ' + JSON.stringify(result))
  )

  firstMountRef.current = false

  return null
}

// utils

const render = (options: Parameters<typeof useQuery>[0], key?: Key) => {
  return rerender(
    <Provider store={store}>
      <TestUseQueryComponent key={key} options={options} />
    </Provider>
  )
}
