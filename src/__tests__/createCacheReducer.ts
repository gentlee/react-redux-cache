import {reducer, updateMutationStateAndEntities, updateQueryStateAndEntities} from '../testing/redux/cache'

test('removes all default query fields, clears default query states', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const states = [reducer(undefined, {} as any)]

  states.push(
    reducer(
      states[0],
      updateQueryStateAndEntities('getUser', 'a', {
        result: 0,
        params: 0,
        loading: false,
        error: undefined,
        expiresAt: 100,
      })
    )
  )

  states.push(
    reducer(
      states[1],
      updateQueryStateAndEntities('getUser', 'a', {
        result: 2,
        params: 1,
        loading: true,
        error: new Error('test'),
        expiresAt: undefined,
      })
    )
  )

  states.push(
    reducer(
      states[2],
      updateQueryStateAndEntities('getUser', 'a', {
        result: 0,
        params: 0,
        loading: false,
        error: undefined,
      })
    )
  )

  states.push(
    reducer(
      states[3],
      updateQueryStateAndEntities('getUser', 'a', {
        result: undefined,
        params: undefined,
      })
    )
  )

  expect(states.map((x) => x.queries.getUser.a)).toStrictEqual([
    undefined,
    {
      result: 0,
      params: 0,
      expiresAt: 100,
    },
    {
      result: 2,
      params: 1,
      loading: true,
      error: new Error('test'),
    },
    {
      result: 0,
      params: 0,
    },
    undefined,
  ])
})

test('removes all default mutation fields, clears default mutation states', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const states = [reducer(undefined, {} as any)]

  states.push(
    reducer(
      states[0],
      updateMutationStateAndEntities('updateUser', {
        result: 0,
        params: {
          id: 0,
          name: 'test',
        },
        loading: true,
        error: undefined,
      })
    )
  )

  states.push(
    reducer(
      states[1],
      updateMutationStateAndEntities('updateUser', {
        result: 2,
        params: {
          id: 1,
          name: 'test2',
        },
        loading: false,
        error: new Error('test'),
      })
    )
  )

  states.push(
    reducer(
      states[2],
      updateMutationStateAndEntities('updateUser', {
        result: 0,
        params: undefined,
        error: undefined,
      })
    )
  )

  states.push(
    reducer(
      states[3],
      updateMutationStateAndEntities('updateUser', {
        result: undefined,
        params: undefined,
      })
    )
  )

  expect(states.map((x) => x.mutations.updateUser)).toStrictEqual([
    undefined,
    {
      result: 0,
      params: {
        id: 0,
        name: 'test',
      },
      loading: true,
    },
    {
      result: 2,
      params: {
        id: 1,
        name: 'test2',
      },
      error: new Error('test'),
    },
    {
      result: 0,
    },
    undefined,
  ])
})
