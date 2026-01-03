import {testCaches} from '../../testing/redux/cache'
import {createReduxStore} from '../../testing/redux/store'

describe.each(testCaches)('%s', (_, cache, withChangeKey) => {
  const {
    actions: {updateQueryStateAndEntities, clearQueryState},
  } = cache

  test('should clear query state with and without cache key', () => {
    const store = createReduxStore(cache)

    store.dispatch(updateQueryStateAndEntities('getUser', 0, {result: 0}))
    store.dispatch(updateQueryStateAndEntities('getUser', 1, {result: 1}))
    store.dispatch(updateQueryStateAndEntities('getUser', 2, {result: 2}))

    // clear two cache keys

    store.dispatch(
      clearQueryState([
        {query: 'getUser', cacheKey: 0},
        {query: 'getUser', cacheKey: 0},
        {query: 'getUser', cacheKey: 2},
      ])
    )
    expect(store.getState().cache.queries.getUser).toStrictEqual(withChangeKey(4, {1: {result: 1}}))

    // clear all cache keys

    store.dispatch(clearQueryState([{query: 'getUser'}]))
    expect(store.getState().cache.queries.getUser).toStrictEqual({})
  })

  test('should work if cache key missing', () => {
    const store = createReduxStore(cache)

    store.dispatch(
      clearQueryState([
        {query: 'getUser'},
        {query: 'getUser', cacheKey: 0},
        {query: 'getUser', cacheKey: 0},
        {query: 'getUser', cacheKey: 2},
        {query: 'getUser'},
        {query: 'getUser', cacheKey: 0},
      ])
    )

    store.dispatch(updateQueryStateAndEntities('getUser', 0, {result: 0}))
    store.dispatch(
      clearQueryState([
        {query: 'getUser', cacheKey: 1},
        {query: 'getUser', cacheKey: 2},
      ])
    )

    expect(store.getState().cache.queries.getUser).toStrictEqual(withChangeKey(0, {0: {result: 0}}))
  })
})
