import {createCache} from '../createCache'

test('createCache returns correct result', () => {
  const {cache, actions, hooks, reducer, selectors, utils} = createTestingCache()

  expect(cache).toStrictEqual({
    abortControllers: new WeakMap(),
    cacheStateSelector: cache.cacheStateSelector,
    options: {
      logsEnabled: false,
      validateFunctionArguments: true,
    },
    typenames,
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
    entities: {
      users: {},
    },
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

  expect(selectors.entitiesSelector).toBeDefined()
  expect(selectors.entitiesByTypenameSelector).toBeDefined()

  expect(hooks.useQuery).toBeDefined()
  expect(hooks.useMutation).toBeDefined()
  expect(hooks.useSelectEntityById).toBeDefined()
  expect(hooks.useClient).toBeDefined()

  expect(utils.applyEntityChanges).toBeDefined()
})

test('supports multiple cache reducers', () => {
  const {
    reducer,
    actions: {mergeEntityChanges},
  } = createTestingCache()

  const {
    actions: {mergeEntityChanges: mergeEntityChangesInSecondCache},
  } = createTestingCache()

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
    mergeEntityChangesInSecondCache({
      remove: {
        users: [1],
      },
    })
  )

  expect(stateAfterSecondCacheAction).toBe(state)
})

const typenames = {
  users: {} as {id: number},
}

const getUser = async (id: number) => ({
  result: id,
  merge: {
    [id]: {id},
  },
})

const updateUser = async (id: number) => ({
  result: id,
})

const createTestingCache = () => {
  return createCache({
    name: 'cache',
    options: {
      logsEnabled: false,
      validateFunctionArguments: true,
    },
    typenames,
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
}
