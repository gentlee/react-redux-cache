import {act} from '@testing-library/react'
import {useSelector, useStore} from 'react-redux'
import {createStore} from 'redux'

import {withTypenames} from '../createCache'
import {CacheToPrivate} from '../private-types'
import {initializeForRedux, setCustomStoreHooks} from '../redux'
import {getUsers, removeUser} from '../testing/api/mocks'
import {consoleWarnSpy} from '../testing/setup'
import {advanceApiTimeout, advanceHalfApiTimeout, apiTimeout} from '../testing/utils'
import {CacheConfig, QueryStateComparer, Typenames, ZustandStoreLike} from '../types'
import {FetchPolicy} from '../utilsAndConstants'
import {initializeForZustand} from '../zustand'

test('createCache returns correct result', () => {
  const onError = jest.fn()
  const cache = createTestingCache('cache', undefined, onError)

  expect(cache).toStrictEqual({
    config: {
      name: 'cache',
      cacheStateKey: 'cache',
      globals: {
        onError,
        queries: {
          fetchPolicy: FetchPolicy.Always,
          secondsToLive: 10,
          skipFetch: false,
          selectorComparer: undefined,
        },
      },
      options: {
        logsEnabled: false,
        additionalValidation: true,
        deepComparisonEnabled: true,
        mutableCollections: false,
      },
      queries: {
        getUser: {
          query: getUser,
        },
        getUsers: {
          query: getUsers,
        },
      },
      mutations: {
        updateUser: {
          mutation: updateUser,
        },
        removeUser: {
          mutation: removeUser,
        },
      },
    },
    abortControllers: expect.any(WeakMap),
    actions: {
      clearCache: expect.any(Function),
      clearMutationState: expect.any(Function),
      clearQueryState: expect.any(Function),
      invalidateQuery: expect.any(Function),
      mergeEntityChanges: expect.any(Function),
      updateMutationStateAndEntities: expect.any(Function),
      updateQueryStateAndEntities: expect.any(Function),
    },
    selectors: {
      selectCacheState: expect.any(Function),
      selectEntities: expect.any(Function),
      selectEntitiesByTypename: expect.any(Function),
      selectEntityById: expect.any(Function),
      selectMutationError: expect.any(Function),
      selectMutationLoading: expect.any(Function),
      selectMutationParams: expect.any(Function),
      selectMutationResult: expect.any(Function),
      selectMutationState: expect.any(Function),
      selectQueryError: expect.any(Function),
      selectQueryExpiresAt: expect.any(Function),
      selectQueryLoading: expect.any(Function),
      selectQueryParams: expect.any(Function),
      selectQueryResult: expect.any(Function),
      selectQueryState: expect.any(Function),
    },
    reducer: expect.any(Function),
    utils: {
      applyEntityChanges: expect.any(Function),
    },
  } satisfies typeof cache)

  expect(
    cache.reducer(
      undefined,
      // @ts-expect-error Empty action
      {},
    ),
  ).toStrictEqual({
    entities: {},
    queries: {
      getUser: {},
      getUsers: {},
    },
    mutations: {},
  })
})

test('supports multiple cache reducers', () => {
  const {
    reducer,
    actions: {mergeEntityChanges},
  } = createTestingCache('cache1')

  const {
    actions: {mergeEntityChanges: mergeEntityChangesInSecondCache},
  } = createTestingCache('cache2')

  const state = reducer(
    undefined,
    mergeEntityChanges({
      entities: {
        users: {1: {id: 1}},
      },
    }),
  )
  // here reducer should not handle action from second cache - should not remove user
  const stateAfterSecondCacheAction = reducer(
    state,
    // @ts-expect-error for testing
    mergeEntityChangesInSecondCache({
      remove: {
        users: [1],
      },
    }),
  )

  expect(stateAfterSecondCacheAction).toBe(state)
})

test.each(['', '.'])('root cacheStateKey', (cacheStateKey) => {
  const {
    reducer,
    selectors: {selectEntities},
  } = createTestingCache('cache', cacheStateKey)
  const store = createStore(reducer)

  expect(selectEntities(store.getState())).toBe(store.getState().entities)
})

test('storeHooks undefined, default redux from react-redux, custom redux and proper zustand, double init, reuse config', () => {
  const cache = createTestingCache('cache')

  // Initial

  expect(cache.storeHooks).toBe(undefined)

  // Redux

  initializeForRedux(cache)

  expect(cache.storeHooks).toStrictEqual({useStore, useSelector, useExternalStore: useStore})

  // Redux double

  const freezedCache = Object.freeze(cache)
  initializeForRedux(freezedCache)

  // Redux Custom

  const customUseStore = jest.fn()
  const customUseSelector = jest.fn()
  setCustomStoreHooks(cache, {
    useStore: customUseStore,
    useSelector: customUseSelector,
    useExternalStore: customUseStore,
  })

  expect(cache.storeHooks).toStrictEqual({
    useStore: customUseStore,
    useSelector: customUseSelector,
    useExternalStore: customUseStore,
  })

  // Zustand & reuse config

  const cache2 = withTypenames<{users: {id: number}}>().createCache(freezedCache.config)
  const zustandLikeStore = {getState: jest.fn} as ZustandStoreLike
  initializeForZustand(cache2, zustandLikeStore)

  expect((cache2 as CacheToPrivate<typeof cache2>).storeHooks).toStrictEqual({
    useStore: expect.any(Function),
    useSelector: zustandLikeStore,
    useExternalStore: expect.any(Function),
  })

  // Zustand double

  initializeForZustand(cache2, zustandLikeStore)

  expect(consoleWarnSpy.mock.calls).toStrictEqual([
    ['@rrc [initializeForZustand]', 'Cache seems to be already initialized'],
  ])
})

test('same cache works with the new store, previous async operations are ignored, state not mutated', async () => {
  const cache = createTestingCache('cache', '')
  const {
    reducer,
    utils: {createClient},
  } = initializeForRedux(cache)

  const store1 = createStore(reducer)
  const initialState1 = Object.freeze(store1.getState())
  {
    const client = createClient(store1)

    client.query({query: 'getUser', params: 0})
    client.query({query: 'getUsers', params: {page: 1}})
    client.mutate({mutation: 'updateUser', params: 2})

    await act(() => advanceHalfApiTimeout())

    client.query({query: 'getUser', params: 1})
    client.query({query: 'getUsers', params: {page: 2}})
    client.mutate({mutation: 'removeUser', params: 1})
  }

  const store2 = createStore(reducer)

  await act(() => advanceApiTimeout())

  expect(store2.getState()).toBe(initialState1)
})

// Utils & constants

const getUser = async (id: number) => {
  await apiTimeout()
  return {
    result: id,
    merge: {
      users: {[id]: {id}},
    },
  }
}

const updateUser = async (id: number) => {
  await apiTimeout()
  return {
    result: id,
  }
}

const createTestingCache = <N extends string>(
  name: N,
  cacheStateKey?: CacheConfig<N, Typenames, unknown, unknown, unknown, unknown>['cacheStateKey'],
  onError?: () => void,
  selectorComparer?: QueryStateComparer<Typenames, unknown, unknown>,
) => {
  const cache = withTypenames<{users: {id: number}}>().createCache({
    name,
    cacheStateKey,
    options: {
      logsEnabled: false,
      additionalValidation: true,
    },
    globals: {
      queries: {
        fetchPolicy: FetchPolicy.Always,
        secondsToLive: 10,
        selectorComparer,
      },
      onError,
    },
    queries: {
      getUser: {
        query: getUser,
      },
      getUsers: {
        query: getUsers,
      },
    },
    mutations: {
      updateUser: {
        mutation: updateUser,
      },
      removeUser: {
        mutation: removeUser,
      },
    },
  })
  return cache as CacheToPrivate<typeof cache>
}
