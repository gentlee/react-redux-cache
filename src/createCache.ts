import {useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'
import {Store} from 'redux'

import {createActions} from './createActions'
import {mutate as mutateImpl} from './mutate'
import {query as queryImpl} from './query'
import {createCacheReducer} from './reducer'
import type {
  Cache,
  CacheOptions,
  EntitiesMap,
  Key,
  MutationResult,
  OptionalPartial,
  QueryOptions,
  QueryResult,
  Typenames,
} from './types'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'
import {applyEntityChanges, defaultGetCacheKey, IS_DEV} from './utilsAndConstants'

/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
export const createCache = <N extends string, T extends Typenames, QP, QR, MP, MR>(
  partialCache: OptionalPartial<
    Cache<N, T, QP, QR, MP, MR>,
    'options' | 'queries' | 'mutations' | 'cacheStateSelector'
  >
) => {
  type TypedCache = Cache<N, T, QP, QR, MP, MR>

  const abortControllers = new WeakMap<Store, Record<Key, AbortController>>()

  // provide all optional fields

  partialCache.options ??= {} as CacheOptions
  partialCache.options.logsEnabled ??= false
  partialCache.options.validateFunctionArguments ??= IS_DEV
  partialCache.queries ??= {} as TypedCache['queries']
  partialCache.mutations ??= {} as TypedCache['mutations']
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  partialCache.cacheStateSelector ??= (state: any) => state[cache.name]
  // @ts-expect-error private field for testing
  partialCache.abortControllers = abortControllers

  const cache = partialCache as TypedCache

  // make selectors

  const entitiesSelector = (state: unknown) => {
    return cache.cacheStateSelector(state).entities
  }

  const enitityMapSelectorByTypename = Object.keys(partialCache.typenames).reduce(
    (result, x: keyof T) => {
      result[x] = (state: unknown) => cache.cacheStateSelector(state).entities[x]
      return result
    },
    {} as {[K in keyof T]: (state: unknown) => EntitiesMap<T>[K]}
  )

  const actions = createActions<N, T, QR, MR>(cache.name)

  return {
    cache,
    /** Reducer of the cache, should be added to redux store. */
    reducer: createCacheReducer<N, T, QR, MR>(
      actions,
      cache.typenames,
      Object.keys(cache.queries) as (keyof QR)[],
      cache.options
    ),
    actions,
    selectors: {
      /** Select all entities from the state. */
      entitiesSelector,
      /** Select all entities of provided typename. */
      entitiesByTypenameSelector: <TN extends keyof T>(typename: TN) => {
        return enitityMapSelectorByTypename[typename]
      },
    },
    hooks: {
      /** Returns client object with query function */
      useClient: () => {
        const store = useStore()
        return useMemo(() => {
          const client = {
            query: <QK extends keyof (QP & QR)>(options: QueryOptions<T, QP, QR, MR, QK>) => {
              type P = QK extends keyof (QP | QR) ? QP[QK] : never
              type R = QK extends keyof (QP | QR) ? QR[QK] : never

              const {query: queryKey, params} = options
              const getCacheKey = cache.queries[queryKey].getCacheKey ?? defaultGetCacheKey<P>
              // @ts-expect-error fix later
              const cacheKey = getCacheKey(params)

              return queryImpl(
                'query',
                true,
                store,
                cache,
                actions,
                queryKey,
                cacheKey,
                params
              ) as Promise<QueryResult<R>>
            },
            mutate: <MK extends keyof (MP & MR)>(options: {
              mutation: MK
              params: MK extends keyof (MP | MR) ? MP[MK] : never
            }) => {
              type R = MK extends keyof (MP | MR) ? MR[MK] : never

              return mutateImpl(
                'mutate',
                true,
                store,
                cache,
                actions,
                options.mutation,
                options.params,
                abortControllers
              ) as Promise<MutationResult<R>>
            },
          }
          return client
        }, [store])
      },

      /** Fetches query when params change and subscribes to query state. */
      useQuery: <QK extends keyof (QP & QR)>(
        options: Parameters<typeof useQuery<N, T, QP, QR, MP, MR, QK>>[2]
      ) => useQuery(cache, actions, options),

      /** Subscribes to provided mutation state and provides mutate function. */
      useMutation: <MK extends keyof (MP & MR)>(
        options: Parameters<typeof useMutation<N, T, MP, MR, MK>>[2]
      ) => useMutation(cache, actions, options, abortControllers),

      /** Selects entity by id and subscribes to the changes. */
      useSelectEntityById: <TN extends keyof T>(
        id: Key | null | undefined,
        typename: TN
      ): T[TN] | undefined => {
        return useSelector((state) =>
          // TODO move to selectors?
          id == null ? undefined : cache.cacheStateSelector(state).entities[typename][id]
        )
      },
    },
    utils: {
      applyEntityChanges: (
        entities: Parameters<typeof applyEntityChanges<T>>[0],
        changes: Parameters<typeof applyEntityChanges<T>>[1]
      ) => {
        return applyEntityChanges<T>(entities, changes, cache.options)
      },
    },
  }
}
