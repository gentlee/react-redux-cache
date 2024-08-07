import {clearQueryState, updateQueryStateAndEntities} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'
import {DEFAULT_QUERY_MUTATION_STATE} from '../../utilsAndConstants'

test('should clear query state with and without cache key', () => {
  const store = createReduxStore(false)

  store.dispatch(
    updateQueryStateAndEntities('getUser', 0, {
      result: 0,
    })
  )
  store.dispatch(
    updateQueryStateAndEntities('getUser', 1, {
      result: 1,
    })
  )
  store.dispatch(
    updateQueryStateAndEntities('getUser', 2, {
      result: 2,
    })
  )

  // clear two cache keys

  store.dispatch(
    clearQueryState([
      {key: 'getUser', cacheKey: 0},
      {key: 'getUser', cacheKey: 0},
      {key: 'getUser', cacheKey: 2},
    ])
  )
  expect(store.getState().queries.getUser).toStrictEqual({
    1: {
      ...DEFAULT_QUERY_MUTATION_STATE,
      result: 1,
    },
  })

  // clear all cache keys

  store.dispatch(clearQueryState([{key: 'getUser'}]))
  expect(store.getState().queries.getUser).toStrictEqual({})
})

test('should work if cache key missing', () => {
  const store = createReduxStore(false)

  store.dispatch(
    clearQueryState([
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
    clearQueryState([
      {key: 'getUser', cacheKey: 1},
      {key: 'getUser', cacheKey: 2},
    ])
  )

  expect(store.getState().queries.getUser).toStrictEqual({
    0: {
      ...DEFAULT_QUERY_MUTATION_STATE,
      result: 0,
    },
  })
})
