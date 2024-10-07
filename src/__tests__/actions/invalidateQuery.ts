import {invalidateQuery, updateQueryStateAndEntities} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'

test('should work with and without cache key', () => {
  const store = createReduxStore(false)

  store.dispatch(updateQueryStateAndEntities('getUser', 0, {result: 0}))
  store.dispatch(updateQueryStateAndEntities('getUser', 1, {result: 1}))
  store.dispatch(updateQueryStateAndEntities('getUser', 2, {result: 2}))

  // invalidate two cache keys

  const now = Date.now()
  store.dispatch(
    invalidateQuery([
      {query: 'getUser', cacheKey: 0},
      {query: 'getUser', cacheKey: 0},
      {query: 'getUser', cacheKey: 1, expiresAt: now + 1000},
    ])
  )
  expect(store.getState().cache.queries.getUser).toStrictEqual({
    0: {result: 0, expiresAt: expect.any(Number)},
    1: {result: 1, expiresAt: now + 1000},
    2: {result: 2},
  })

  // invalidate all cache keys

  store.dispatch(invalidateQuery([{query: 'getUser'}]))

  const getUserStates = store.getState().cache.queries.getUser
  expect(getUserStates[0]!.expiresAt).toBe(getUserStates[1]!.expiresAt)
  expect(getUserStates[1]!.expiresAt).toBe(getUserStates[2]!.expiresAt)
  expect(typeof getUserStates[2]!.expiresAt).toBe('number')
})

test('should work if cache key missing', () => {
  const store = createReduxStore(false)

  store.dispatch(
    invalidateQuery([
      {query: 'getUser'},
      {query: 'getUser', cacheKey: 0},
      {query: 'getUser', cacheKey: 0},
      {query: 'getUser', cacheKey: 2},
      {query: 'getUser'},
      {query: 'getUser', cacheKey: 0},
    ])
  )

  store.dispatch(
    updateQueryStateAndEntities('getUser', 0, {
      result: 0,
    })
  )
  store.dispatch(
    invalidateQuery([
      {query: 'getUser', cacheKey: 1},
      {query: 'getUser', cacheKey: 2},
    ])
  )

  expect(store.getState().cache.queries.getUser).toStrictEqual({0: {result: 0}})
})
