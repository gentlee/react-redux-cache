import {createCache} from '..'

test('createCache returns correct result', () => {
  // assign

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

  const {cache, reducer, actions, hooks} = createCache({
    cacheStateSelector,
    options: {
      logsEnabled: true,
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
      logsEnabled: true,
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

  expect(hooks.useQuery).toBeDefined()
  expect(hooks.useMutation).toBeDefined()
  expect(hooks.useSelectEntityById).toBeDefined()
  expect(hooks.useSelectDenormalized).toBeDefined()
})
