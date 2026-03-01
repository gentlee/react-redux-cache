import {useSelector, useStore} from 'react-redux'

import {withTypenames} from '../../createCache'
import {initializeForReact} from '../../react/initializeForReact'
import {initializeForRedux} from '../../redux'
import {createTestCache} from '../../testing/redux/cache'
import {ZustandStoreLike} from '../../types'
import {CacheExtensions, CacheToPrivate, StoreHooksPrivate} from '../../typesPrivate'
import {initializeForZustand} from '../../zustand'

test('createHooks returns correct result', () => {
  const cache = createTestCache(true, undefined, undefined, false)
  const result = initializeForReact(cache)

  expect(result).toStrictEqual({
    hooks: {
      useClient: expect.any(Function),
      useEntitiesByTypename: expect.any(Function),
      useMutation: expect.any(Function),
      useQuery: expect.any(Function),
      useSelectEntityById: expect.any(Function),
    },
  } satisfies typeof result)
})

test('default redux from react-redux, custom redux hooks, correct zustand hooks, reuse config', () => {
  // React Redux default

  const reduxCache = createTestCache(false)
  initializeForRedux(reduxCache)

  expect(reduxCache.extensions!.react!.storeHooks).toStrictEqual({
    useStore,
    useExternalStore: useStore,
    useSelector,
  } satisfies NonNullable<NonNullable<CacheExtensions['react']>['storeHooks']>)

  // React Redux custom hooks

  {
    const customUseStore = jest.fn()
    const customUseSelector = jest.fn()

    const reduxCache2 = createTestCache(false, undefined, undefined, false)
    initializeForRedux(reduxCache2)
    initializeForReact(reduxCache2, {
      useStore: customUseStore,
      useSelector: customUseSelector,
    })

    expect(reduxCache2.extensions!.react!.storeHooks).toStrictEqual({
      useStore: customUseStore,
      useExternalStore: customUseStore,
      useSelector: customUseSelector,
    } satisfies StoreHooksPrivate)
  }

  // React Zustand & Config reuse

  const freezedCache = Object.freeze(reduxCache)
  const zustandCache = withTypenames<{users: {id: number}}>().createCache(freezedCache.config)
  const zustandLikeStore = {getState: jest.fn} as ZustandStoreLike
  initializeForZustand(zustandCache, zustandLikeStore)
  initializeForReact(zustandCache)

  expect((zustandCache as CacheToPrivate<typeof zustandCache>).extensions!.react!.storeHooks).toStrictEqual({
    useStore: expect.any(Function),
    useSelector: zustandLikeStore,
    useExternalStore: expect.any(Function),
  })
})
