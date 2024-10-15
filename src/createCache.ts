import {useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'
import {Store} from 'redux'

import {createActions} from './createActions'
import {createCacheReducer} from './createCacheReducer'
import {mutate as mutateImpl} from './mutate'
import {query as queryImpl} from './query'
import type {
  Cache,
  CacheOptions,
  Globals,
  Key,
  MutateOptions,
  MutationResult,
  MutationState,
  OptionalPartial,
  QueryOptions,
  QueryResult,
  QueryState,
  Typenames,
} from './types'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'
import {
  applyEntityChanges,
  defaultGetCacheKey,
  EMPTY_OBJECT,
  IS_DEV,
  optionalUtils,
} from './utilsAndConstants'

/**
 * Function to provide generic Typenames if normalization is needed - this is a Typescript limitation.
 * Returns object with createCache function with provided typenames.
 * @example
 * const cache = withTypenames<MyTypenames>().createCache({
 *   ...
 * })
 */
export const withTypenames = <T extends Typenames = Typenames>() => {
  /**
   * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
   */
  return {
    createCache: <N extends string, QP, QR, MP, MR>(
      partialCache: OptionalPartial<
        Cache<N, T, QP, QR, MP, MR>,
        'options' | 'queries' | 'mutations' | 'cacheStateSelector' | 'globals'
      >
    ) => {
      type TypedCache = Cache<N, T, QP, QR, MP, MR>

      const abortControllers = new WeakMap<Store, Record<Key, AbortController>>()

      // provide all optional fields

      partialCache.options ??= {} as CacheOptions
      partialCache.options.logsEnabled ??= false
      partialCache.options.additionalValidation ??= IS_DEV
      partialCache.options.deepComparisonEnabled ??= true
      partialCache.queries ??= {} as TypedCache['queries']
      partialCache.mutations ??= {} as TypedCache['mutations']
      partialCache.globals ??= {} as Globals
      partialCache.globals.cachePolicy ??= 'cache-first'
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      partialCache.cacheStateSelector ??= (state: any) => state[cache.name]
      // @ts-expect-error private field for testing
      partialCache.abortControllers = abortControllers

      const cache = partialCache as TypedCache

      // validate options

      if (cache.options.deepComparisonEnabled && !optionalUtils.deepEqual) {
        console.warn(
          'react-redux-cache: optional dependency for fast-deep-equal was not provided, while deepComparisonEnabled option is true'
        )
      }

      // make selectors

      const selectEntityById = <TN extends keyof T>(
        state: unknown,
        id: Key | null | undefined,
        typename: TN
      ) => {
        return id == null ? undefined : cache.cacheStateSelector(state).entities[typename]?.[id]
      }

      const selectQueryState = <QK extends keyof (QP & QR)>(
        state: unknown,
        query: QK,
        cacheKey: Key
      ): QueryState<
        QK extends keyof (QP | QR) ? QP[QK] : never,
        QK extends keyof (QP | QR) ? QR[QK] : never
      > => {
        // @ts-expect-error fix later
        return cache.cacheStateSelector(state).queries[query][cacheKey] ?? EMPTY_OBJECT
      }

      const selectMutationState = <MK extends keyof (MP & MR)>(
        state: unknown,
        mutation: MK
      ): MutationState<
        MK extends keyof (MP | MR) ? MP[MK] : never,
        MK extends keyof (MP | MR) ? MR[MK] : never
      > => {
        // @ts-expect-error fix later
        return cache.cacheStateSelector(state).mutations[mutation] ?? EMPTY_OBJECT
      }

      const actions = createActions<N, T, QP, QR, MP, MR>(cache.name)
      const {
        updateQueryStateAndEntities,
        updateMutationStateAndEntities,
        mergeEntityChanges,
        invalidateQuery,
        clearQueryState,
        clearMutationState,
      } = actions

      return {
        /** Keeps all options, passed while creating the cache. */
        cache,
        /** Reducer of the cache, should be added to redux store. */
        reducer: createCacheReducer<N, T, QP, QR, MP, MR>(
          actions,
          Object.keys(cache.queries) as (keyof (QP | QR))[],
          cache.options
        ),
        actions: {
          /** Updates query state, and optionally merges entity changes in a single action. */
          updateQueryStateAndEntities,
          /** Updates mutation state, and optionally merges entity changes in a single action. */
          updateMutationStateAndEntities,
          /** Merge EntityChanges to the state. */
          mergeEntityChanges,
          /** Invalidates query states. */
          invalidateQuery,
          /** Clear states for provided query keys and cache keys.
           * If cache key for query key is not provided, the whole state for query key is cleared. */
          clearQueryState,
          /** Clear states for provided mutation keys. */
          clearMutationState,
        },
        selectors: {
          /** Selects query state. */
          selectQueryState,
          /** Selects query latest result. */
          selectQueryResult: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
            return selectQueryState(state, query, cacheKey).result
          },
          /** Selects query loading state. */
          selectQueryLoading: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
            return selectQueryState(state, query, cacheKey).loading ?? false
          },
          /** Selects query latest error. */
          selectQueryError: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
            return selectQueryState(state, query, cacheKey).error
          },
          /** Selects query latest params. */
          selectQueryParams: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
            return selectQueryState(state, query, cacheKey).params
          },
          /** Selects query latest expiresAt. */
          selectQueryExpiresAt: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
            return selectQueryState(state, query, cacheKey).expiresAt
          },
          /** Selects mutation state. */
          selectMutationState,
          /** Selects mutation latest result. */
          selectMutationResult: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => {
            return selectMutationState(state, mutation).result
          },
          /** Selects mutation loading state. */
          selectMutationLoading: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => {
            return selectMutationState(state, mutation).loading ?? false
          },
          /** Selects mutation latest error. */
          selectMutationError: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => {
            return selectMutationState(state, mutation).error
          },
          /** Selects mutation latest params. */
          selectMutationParams: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => {
            return selectMutationState(state, mutation).params
          },
          /** Selects entity by id and typename. */
          selectEntityById,
          /** Selects all entities. */
          selectEntities: (state: unknown) => {
            return cache.cacheStateSelector(state).entities
          },
          /** Selects all entities of provided typename. */
          selectEntitiesByTypename: <TN extends keyof T>(state: unknown, typename: TN) => {
            return cache.cacheStateSelector(state).entities[typename]
          },
        },
        hooks: {
          /** Returns client object with query and mutate functions. */
          useClient: () => {
            const store = useStore()
            return useMemo(() => {
              const client = {
                query: <QK extends keyof (QP & QR)>(options: QueryOptions<T, QP, QR, QK>) => {
                  type P = QK extends keyof (QP | QR) ? QP[QK] : never
                  type R = QK extends keyof (QP | QR) ? QR[QK] : never

                  const {query: queryKey, params} = options
                  const getCacheKey = cache.queries[queryKey].getCacheKey ?? defaultGetCacheKey<P>
                  // @ts-expect-error fix later
                  const cacheKey = getCacheKey(params)

                  return queryImpl(
                    'query',
                    store,
                    cache,
                    actions,
                    queryKey,
                    cacheKey,
                    params,
                    options.secondsToLive,
                    options.onlyIfExpired,
                    // @ts-expect-error fix later
                    options.mergeResults,
                    options.onCompleted,
                    options.onSuccess,
                    options.onError
                  ) as Promise<QueryResult<R>>
                },
                mutate: <MK extends keyof (MP & MR)>(options: MutateOptions<T, MP, MR, MK>) => {
                  type R = MK extends keyof (MP | MR) ? MR[MK] : never

                  return mutateImpl(
                    'mutate',
                    store,
                    cache,
                    actions,
                    options.mutation,
                    options.params,
                    abortControllers,
                    // @ts-expect-error fix later
                    options.onCompleted,
                    options.onSuccess,
                    options.onError
                  ) as Promise<MutationResult<R>>
                },
              }
              return client
            }, [store])
          },
          /** Fetches query when params change and subscribes to query state changes (except `expiresAt` field). */
          useQuery: <QK extends keyof (QP & QR)>(
            options: Parameters<typeof useQuery<N, T, QP, QR, MP, MR, QK>>[2]
          ) => useQuery(cache, actions, options),
          /** Subscribes to provided mutation state and provides mutate function. */
          useMutation: <MK extends keyof (MP & MR)>(
            options: Parameters<typeof useMutation<N, T, MP, MR, MK>>[2]
          ) => useMutation(cache, actions, options, abortControllers),
          /** useSelector + selectEntityById. */
          useSelectEntityById: <TN extends keyof T>(
            id: Key | null | undefined,
            typename: TN
          ): T[TN] | undefined => {
            return useSelector((state) => selectEntityById(state, id, typename))
          },
        },
        utils: {
          /** Apply changes to the entities map.
           * @returns `undefined` if nothing to change, otherwise new `EntitiesMap<T>` with applied changes. */
          applyEntityChanges: (
            entities: Parameters<typeof applyEntityChanges<T>>[0],
            changes: Parameters<typeof applyEntityChanges<T>>[1]
          ) => {
            return applyEntityChanges<T>(entities, changes, cache.options)
          },
        },
      }
    },
  }
}

/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
export const createCache = withTypenames().createCache
