import {act} from '@testing-library/react'
import {useSelector, useStore} from 'react-redux'
import {createStore} from 'redux'

import {withTypenames} from '../createCache'
import {getUsers, removeUser} from '../testing/api/mocks'
import {advanceApiTimeout, advanceHalfApiTimeout, apiTimeout} from '../testing/utils'
import {Cache, Typenames} from '../types'
import {FetchPolicy} from '../utilsAndConstants'

const overridenHooks = {
  useStore: jest.fn(),
  useSelector: jest.fn(),
}

test('createCache returns correct result', () => {
  const onError = jest.fn()
  const {cache, actions, hooks, reducer, selectors, utils} = createTestingCache(
    'cache',
    true,
    undefined,
    onError
  )

  expect(cache).toStrictEqual({
    name: 'cache',
    abortControllers: new WeakMap(),
    storeHooks: overridenHooks,
    cacheStateSelector: cache.cacheStateSelector,
    globals: {
      onError,
      queries: {
        fetchPolicy: FetchPolicy.Always,
        secondsToLive: 10,
        skipFetch: false,
      },
    },
    options: {
      logsEnabled: false,
      additionalValidation: true,
      deepComparisonEnabled: true,
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

  expect(
    reducer(
      undefined,
      // @ts-expect-error Empty action
      {}
    )
  ).toStrictEqual({
    entities: {},
    queries: {
      getUser: {},
      getUsers: {},
    },
    mutations: {},
  })

  expect(actions.mergeEntityChanges).toBeDefined()
  expect(actions.updateMutationStateAndEntities).toBeDefined()
  expect(actions.updateQueryStateAndEntities).toBeDefined()
  expect(actions.clearQueryState).toBeDefined()
  expect(actions.clearMutationState).toBeDefined()

  expect(selectors.selectEntityById).toBeDefined()
  expect(selectors.selectEntities).toBeDefined()
  expect(selectors.selectEntitiesByTypename).toBeDefined()
  expect(selectors.selectQueryState).toBeDefined()
  expect(selectors.selectQueryResult).toBeDefined()
  expect(selectors.selectQueryLoading).toBeDefined()
  expect(selectors.selectQueryError).toBeDefined()
  expect(selectors.selectQueryParams).toBeDefined()
  expect(selectors.selectMutationState).toBeDefined()
  expect(selectors.selectMutationResult).toBeDefined()
  expect(selectors.selectMutationLoading).toBeDefined()
  expect(selectors.selectMutationError).toBeDefined()
  expect(selectors.selectMutationParams).toBeDefined()

  expect(hooks.useQuery).toBeDefined()
  expect(hooks.useMutation).toBeDefined()
  expect(hooks.useClient).toBeDefined()
  expect(hooks.useSelectEntityById).toBeDefined()

  expect(utils.getInitialState).toBeDefined()
  expect(utils.applyEntityChanges).toBeDefined()
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
    })
  )
  // here reducer should not handle action from second cache - should not remove user
  const stateAfterSecondCacheAction = reducer(
    state,
    // @ts-expect-error for testing
    mergeEntityChangesInSecondCache({
      remove: {
        users: [1],
      },
    })
  )

  expect(stateAfterSecondCacheAction).toBe(state)
})

test('custom cacheStateSelector', () => {
  const {
    reducer,
    selectors: {selectEntities},
  } = createTestingCache('cache', true, (state) => state)
  const store = createStore(reducer)

  // cacheStateSelector is used in all selectors
  expect(selectEntities(store.getState())).toBe(store.getState().entities)
})

test('using react-redux store hooks when not overriden', () => {
  const {
    cache: {storeHooks},
  } = createTestingCache('cache', false)

  expect(storeHooks).toStrictEqual({useStore, useSelector})
})

test('same cache works with the new store, previous async operations are ignored', async () => {
  const {
    reducer,
    utils: {createClient, getInitialState},
  } = createTestingCache('cache', false, (x) => x)

  {
    const store = createStore(reducer)
    const client = createClient(store)

    client.query({query: 'getUser', params: 0})
    client.query({query: 'getUsers', params: {page: 1}})
    client.mutate({mutation: 'updateUser', params: 2})

    await act(() => advanceHalfApiTimeout())

    client.query({query: 'getUser', params: 1})
    client.query({query: 'getUsers', params: {page: 2}})
    client.mutate({mutation: 'removeUser', params: 1})
  }

  const store = createStore(reducer)

  await act(() => advanceApiTimeout())

  expect(store.getState()).toBe(getInitialState())
})

// utils & constants

const getUser = async (id: number) => {
  await apiTimeout()
  return {
    result: id,
    merge: {[id]: {id}},
  }
}

const updateUser = async (id: number) => {
  await apiTimeout()
  return {
    result: id,
  }
}

export const createTestingCache = <N extends string>(
  name: N,
  overrideHooks = true,
  cacheStateSelector?: Cache<N, Typenames, unknown, unknown, unknown, unknown>['cacheStateSelector'],
  onError?: () => void
) => {
  return withTypenames<{
    users: {id: number}
  }>().createCache({
    name,
    options: {
      logsEnabled: false,
      additionalValidation: true,
    },
    globals: {
      queries: {
        fetchPolicy: FetchPolicy.Always,
        secondsToLive: 10,
      },
      onError,
    },
    storeHooks: overrideHooks ? overridenHooks : undefined,
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
    cacheStateSelector,
  })
}
