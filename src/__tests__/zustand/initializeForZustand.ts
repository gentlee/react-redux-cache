import {createTestCache} from '../../testing/redux/cache'
import {consoleWarnSpy} from '../../testing/setup'
import {ZustandStoreLike} from '../../types'
import {CacheExtensions} from '../../typesPrivate'
import {initializeForZustand} from '../../zustand'

test('initializeForZustand correct result, double init warns', () => {
  const cache = createTestCache(false, '123')

  // Zustand

  const zustandLikeStore = {getState: jest.fn} as ZustandStoreLike
  const result = initializeForZustand(cache, zustandLikeStore)

  expect(cache.extensions?.zustand).toStrictEqual({
    innerStore: {
      dispatch: expect.any(Function),
      getState: expect.any(Function),
    },
    externalStore: zustandLikeStore,
  } satisfies NonNullable<CacheExtensions['zustand']>)

  // Zustand double

  const result2 = initializeForZustand(cache, zustandLikeStore)

  expect(consoleWarnSpy.mock.calls).toStrictEqual([
    ['@rrc [initializeForZustand]', 'Already initialized for Zustand'],
  ])
  consoleWarnSpy.mockClear()
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
        query: expect.any(Function),
        mutate: expect.any(Function),
      },
    } satisfies ReturnType<typeof initializeForZustand>)
  })
})
