import {createCache} from '..'

test('createCache returns correct result', () => {
  // assign

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

  // act

  const {cache, reducer, actions, selectors, hooks} = createCache({
    cacheStateSelector,
    options: {
      logsEnabled: false,
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

  // assert

  expect(cache).toStrictEqual({
    cacheStateSelector,
    options: {
      logsEnabled: false,
      validateFunctionArguments: false,
      validateHookArguments: false,
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
  expect(actions.setMutationStateAndEntities).toBeDefined()
  expect(actions.setQueryStateAndEntities).toBeDefined()

  expect(selectors.entitiesSelector).toBeDefined()
  expect(selectors.entitiesByTypenameSelector).toBeDefined()

  expect(hooks.useQuery).toBeDefined()
  expect(hooks.useMutation).toBeDefined()
  expect(hooks.useSelectEntityById).toBeDefined()
})
