import {invalidateQuery, updateQueryStateAndEntities} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'
import {DEFAULT_QUERY_MUTATION_STATE} from '../../utilsAndConstants'

test('should work with and without cache key', () => {
  const store = createReduxStore(false)

  store.dispatch(updateQueryStateAndEntities('getUser', 0, {result: 0}))
  store.dispatch(updateQueryStateAndEntities('getUser', 1, {result: 1}))
  store.dispatch(updateQueryStateAndEntities('getUser', 2, {result: 2}))

  // invalidate two cache keys

  const now = Date.now()
  store.dispatch(
    invalidateQuery([
      {key: 'getUser', cacheKey: 0},
      {key: 'getUser', cacheKey: 0},
      {key: 'getUser', cacheKey: 1, expiresAt: now + 1000},
    ])
  )
  expect(store.getState().cache.queries.getUser).toStrictEqual({
    0: {...DEFAULT_QUERY_MUTATION_STATE, result: 0, expiresAt: expect.any(Number)},
    1: {...DEFAULT_QUERY_MUTATION_STATE, result: 1, expiresAt: now + 1000},
    2: {...DEFAULT_QUERY_MUTATION_STATE, result: 2},
  })

  // invalidate all cache keys

  store.dispatch(invalidateQuery([{key: 'getUser'}]))

  const getUserStates = store.getState().cache.queries.getUser
  expect(getUserStates[0]!.expiresAt).toBe(getUserStates[1]!.expiresAt)
  expect(getUserStates[1]!.expiresAt).toBe(getUserStates[2]!.expiresAt)
  expect(typeof getUserStates[2]!.expiresAt).toBe('number')
})

test('should work if cache key missing', () => {
  const store = createReduxStore(false)

  store.dispatch(
    invalidateQuery([
      {key: 'getUser'},
      {key: 'getUser', cacheKey: 0},
      {key: 'getUser', cacheKey: 0},
      {key: 'getUser', cacheKey: 2},
      {key: 'getUser'},
      {key: 'getUser', cacheKey: 0},
    ])
  )

  store.dispatch(
    updateQueryStateAndEntities('getUser', 0, {
      result: 0,
    })
  )
  store.dispatch(
    invalidateQuery([
      {key: 'getUser', cacheKey: 1},
      {key: 'getUser', cacheKey: 2},
    ])
  )

  expect(store.getState().cache.queries.getUser).toStrictEqual({
    0: {
      ...DEFAULT_QUERY_MUTATION_STATE,
      result: 0,
    },
  })
})
