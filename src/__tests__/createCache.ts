import {createStore} from 'redux'

import {withTypenames} from '../createCache'
import {Cache, Typenames} from '../types'

test('createCache returns correct result', () => {
  const {cache, actions, hooks, reducer, selectors, utils} = createTestingCache('cache')

  expect(cache).toStrictEqual({
    name: 'cache',
    abortControllers: new WeakMap(),
    cacheStateSelector: cache.cacheStateSelector,
    options: {
      logsEnabled: false,
      validateFunctionArguments: true,
      deepComparisonEnabled: true,
    },
    queries: {
      getUser: {
        query: getUser,
      },
    },
    mutations: {
      updateUser: {
        mutation: updateUser,
      },
    },
  })

  // @ts-expect-error test type not supported
  expect(reducer(undefined, {type: 'test'})).toStrictEqual({
    entities: {},
    queries: {
      getUser: {},
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
  } = createTestingCache('cache', (state) => state)
  const store = createStore(reducer)

  // cacheStateSelector is used in all selectors
  expect(selectEntities(store.getState())).toBe(store.getState().entities)
})

// utils & constants

const getUser = async (id: number) => ({
  result: id,
  merge: {
    [id]: {id},
  },
})

const updateUser = async (id: number) => ({
  result: id,
})

const createTestingCache = <N extends string>(
  name: N,
  cacheStateSelector?: Cache<N, Typenames, unknown, unknown, unknown, unknown>['cacheStateSelector']
) => {
  return withTypenames<{
    users: {id: number}
  }>().createCache({
    name,
    options: {
      logsEnabled: false,
      validateFunctionArguments: true,
    },
    queries: {
      getUser: {
        query: getUser,
      },
    },
    mutations: {
      updateUser: {
        mutation: updateUser,
      },
    },
    cacheStateSelector,
  })
}
