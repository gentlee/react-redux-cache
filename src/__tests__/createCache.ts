import {createCache} from '../createCache'

test('createCache returns correct result', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cacheStateSelector = (state: any) => state
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

  const {cache, reducer, actions, selectors, hooks} = createCache({
    cacheStateSelector,
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

  expect(cache).toStrictEqual({
    abortControllers: new WeakMap(),
    cacheStateSelector,
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
})
