import {useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'
import {Store} from 'redux'

import {
  clearMutationState,
  clearQueryState,
  mergeEntityChanges,
  updateMutationStateAndEntities,
  updateQueryStateAndEntities,
} from './actions'
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
export const createCache = <T extends Typenames, QP, QR, MP, MR>(
  partialCache: OptionalPartial<Cache<T, QP, QR, MP, MR>, 'options' | 'queries' | 'mutations'>
) => {
  const abortControllers = new WeakMap<Store, Record<Key, AbortController>>()

  // provide all optional fields

  partialCache.options ??= {} as CacheOptions
  partialCache.options.logsEnabled ??= false
  partialCache.options.validateFunctionArguments ??= IS_DEV
  partialCache.queries ??= {} as Cache<T, QP, QR, MP, MR>['queries']
  partialCache.mutations ??= {} as Cache<T, QP, QR, MP, MR>['mutations']
  // @ts-expect-error for testing
  partialCache.abortControllers = abortControllers

  const cache = partialCache as Cache<T, QP, QR, MP, MR>

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

  return {
    cache,
    /** Reducer of the cache, should be added to redux store. */
    reducer: createCacheReducer<T, QP, QR, MP, MR>(
      cache.typenames,
      cache.queries,
      cache.mutations,
      cache.options
    ),
    actions: {
      /** Updates query state, and optionally merges entity changes in a single action. */
      updateQueryStateAndEntities: updateQueryStateAndEntities as <K extends keyof QR>(
        ...args: Parameters<typeof updateQueryStateAndEntities<T, QR, K>>
      ) => ReturnType<typeof updateQueryStateAndEntities<T, QR, K>>,

      /** Updates mutation state, and optionally merges entity changes in a single action. */
      updateMutationStateAndEntities: updateMutationStateAndEntities as <K extends keyof MR>(
        ...args: Parameters<typeof updateMutationStateAndEntities<T, MR, K>>
      ) => ReturnType<typeof updateMutationStateAndEntities<T, MR, K>>,

      /** Merge EntityChanges to the state. */
      mergeEntityChanges: mergeEntityChanges as typeof mergeEntityChanges<T>,

      /** Clear states for provided query keys and cache keys.
       * If cache key for query key is not provided, the whole state for query key is cleared. */
      clearQueryState: clearQueryState as <K extends keyof QR>(
        ...args: Parameters<typeof clearQueryState<QR, K>>
      ) => ReturnType<typeof clearQueryState<QR, K>>,

      /** Clear states for provided mutation keys. */
      clearMutationState: clearMutationState as <K extends keyof MR>(
        ...args: Parameters<typeof clearMutationState<MR, K>>
      ) => ReturnType<typeof clearMutationState<MR, K>>,
    },
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
            query: <QK extends keyof (QP & QR)>(options: QueryOptions<T, QP, QR, MP, MR, QK>) => {
              type P = QK extends keyof (QP | QR) ? QP[QK] : never
              type R = QK extends keyof (QP | QR) ? QR[QK] : never

              const {query: queryKey, params} = options
              const getCacheKey = cache.queries[queryKey].getCacheKey ?? defaultGetCacheKey<P>
              // @ts-expect-error fix later
              const cacheKey = getCacheKey(params)

              return queryImpl('query', true, store, cache, queryKey, cacheKey, params) as Promise<
                QueryResult<R>
              >
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
        options: Parameters<typeof useQuery<T, QP, QR, MP, MR, QK>>[1]
      ) => useQuery(cache, options),

      /** Subscribes to provided mutation state and provides mutate function. */
      useMutation: <MK extends keyof (MP & MR)>(
        options: Parameters<typeof useMutation<T, MP, MR, MK>>[1]
      ) => useMutation(cache, options, abortControllers),

      /** Selects entity by id and subscribes to the changes. */
      useSelectEntityById: <K extends keyof T>(
        id: Key | null | undefined,
        typename: K
      ): T[K] | undefined => {
        return useSelector((state) =>
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
