import {initializeForRedux} from '../../redux'
import {createTestCache} from '../../testing/redux/cache'

test('initializeForRedux correct result, keeps extensions undefined, double init works', () => {
  const cache = createTestCache(false, undefined, undefined, false)

  // Initial

  expect(cache.extensions).toBe(undefined)

  // Redux

  const result = initializeForRedux(cache)

  expect(cache.extensions).toBe(undefined)

  // Redux double

  const freezedCache = Object.freeze(cache)
  const result2 = initializeForRedux(freezedCache)

  expect(cache.extensions).toBe(undefined)
  expect(result === result2).toBeFalsy()
  ;[result, result2].forEach((r) => {
    expect(r).toStrictEqual({
      actions: {
        clearCache: expect.any(Function),
        clearMutationState: expect.any(Function),
        clearQueryState: expect.any(Function),
        invalidateQuery: expect.any(Function),
        mergeEntityChanges: expect.any(Function),
        updateMutationStateAndEntities: expect.any(Function),
        updateQueryStateAndEntities: expect.any(Function),
      },
      reducer: expect.any(Function),
      utils: {
        createClient: expect.any(Function),
      },
    } satisfies ReturnType<typeof initializeForRedux>)
  })
})
