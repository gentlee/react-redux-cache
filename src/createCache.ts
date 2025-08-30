// Disabling this to import unused types to remove import() from generated types.
/* eslint-disable @typescript-eslint/no-unused-vars */
import {useMemo} from 'react'

import {createActions} from './createActions'
import {createReducer} from './createReducer'
import {createSelectors} from './createSelectors'
import {mutate as mutateImpl} from './mutate'
import {query as queryImpl} from './query'
import type {
  Cache,
  CacheOptions,
  CacheState,
  Dict,
  EntitiesMap,
  EntityChanges,
  EntityIds,
  Globals,
  Key,
  MutateOptions,
  Mutation,
  MutationInfo,
  MutationResponse,
  MutationResult,
  MutationState,
  NormalizedMutation,
  NormalizedMutationResponse,
  NormalizedQuery,
  NormalizedQueryResponse,
  OptionalPartial,
  PartialEntitiesMap,
  Query,
  QueryInfo,
  QueryOptions,
  QueryResponse,
  QueryResult,
  QueryState,
  QueryStateComparer,
  Store,
  Typenames,
  UseQueryOptions,
} from './types'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'
import {
  applyEntityChanges,
  createStateComparer,
  defaultGetCacheKey,
  EMPTY_OBJECT,
  FetchPolicy,
  IS_DEV,
  logWarn,
  optionalUtils,
} from './utilsAndConstants'

/**
 * Function to provide generic Typenames if normalization is needed - this is a Typescript limitation.
 * Returns object with createCache function with provided typenames.
 * @example
 * `const cache = withTypenames<MyTypenames>().createCache({...})`
 */
export const withTypenames = <T extends Typenames = Typenames>() => {
  return {
    /** Creates reducer, actions and hooks for managing queries and mutations. */
    createCache: <N extends string, QP, QR, MP, MR>(
      partialCache: OptionalPartial<
        Omit<Cache<N, T, QP, QR, MP, MR>, 'globals'>,
        'options' | 'queries' | 'mutations' | 'cacheStateSelector' | 'storeHooks'
      > & {
        globals?: OptionalPartial<Cache<N, T, QP, QR, MP, MR>['globals'], 'queries'>
      }
    ) => {
      type TypedCache = Cache<N, T, QP, QR, MP, MR>

      const abortControllers = new WeakMap<Store, Record<Key, AbortController>>()

      // Provide all optional fields

      partialCache.options ??= {} as CacheOptions
      partialCache.options.logsEnabled ??= false
      partialCache.options.additionalValidation ??= IS_DEV
      partialCache.options.deepComparisonEnabled ??= true
      partialCache.globals ??= {}
      partialCache.globals.queries ??= {} as Globals<N, T, QP, QR, MP, MR>['queries']
      partialCache.globals.queries.fetchPolicy ??= FetchPolicy.NoCacheOrExpired
      partialCache.globals.queries.skipFetch ??= false
      partialCache.cacheStateSelector ??= (state: Record<string, unknown>) => state[cache.name]
      partialCache.mutations ??= {} as TypedCache['mutations']
      partialCache.queries ??= {} as TypedCache['queries']
      // @ts-expect-error private field for testing
      partialCache.abortControllers = abortControllers

      // Try/catch just for bunders like metro to consider this as optional dependency
      // eslint-disable-next-line no-useless-catch
      try {
        partialCache.storeHooks ??= {
          useStore: require('react-redux').useStore,
          useSelector: require('react-redux').useSelector,
        } as TypedCache['storeHooks']
      } catch (e) {
        throw e
      }

      const cache = partialCache as TypedCache

      // Validate options

      if (cache.options.deepComparisonEnabled && !optionalUtils.deepEqual) {
        logWarn(
          'createCache',
          'optional dependency for fast-deep-equal was not provided, while deepComparisonEnabled option is true'
        )
      }

      // State comparers

      // Transforms array of keys to comparer function.
      const setDefaultComparer = (
        target: Pick<TypedCache['globals']['queries'], 'selectorComparer'> | undefined
      ) => {
        if (target?.selectorComparer != null && typeof target.selectorComparer === 'object') {
          target.selectorComparer = createStateComparer(target.selectorComparer)
        }
      }

      setDefaultComparer(cache.globals.queries)
      for (const queryKey in partialCache.queries) {
        // @ts-expect-error TODO fix types
        setDefaultComparer(partialCache.queries[queryKey as keyof TypedCache['queries']])
      }

      // Selectors

      const selectors = {
        selectCacheState: cache.cacheStateSelector,
        ...createSelectors<N, T, QP, QR, MP, MR>(cache),
      }
      const {
        selectCacheState,
        selectQueryState,
        selectQueryResult,
        selectQueryLoading,
        selectQueryError,
        selectQueryParams,
        selectQueryExpiresAt,
        selectMutationState,
        selectMutationResult,
        selectMutationLoading,
        selectMutationError,
        selectMutationParams,
        selectEntityById,
        selectEntities,
        selectEntitiesByTypename,
      } = selectors

      // Actions

      const actions = createActions<N, T, QP, QR, MP, MR>(cache.name)
      const {
        updateQueryStateAndEntities,
        updateMutationStateAndEntities,
        mergeEntityChanges,
        invalidateQuery,
        clearQueryState,
        clearMutationState,
        clearCache,
      } = actions

      // Reducer

      const reducer = createReducer<N, T, QP, QR, MP, MR>(
        actions,
        Object.keys(cache.queries) as (keyof (QP | QR))[],
        cache.options
      )

      // Client creator

      const createClient = (store: Store) => {
        // doc-header
        const client = {
          /**
           * Performs a query using provided options. Deduplicates calls with the same cache key. Always returns current cached result, even when query is cancelled or finished with error.
           * @param onlyIfExpired When true, cancels fetch if result is not yet expired.
           * @param skipFetch Fetch is cancelled and current cached result is returned.
           */
          query: <QK extends keyof (QP & QR)>(options: QueryOptions<N, T, QP, QR, QK, MP, MR>) => {
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
              selectors,
              queryKey,
              cacheKey,
              params,
              options.secondsToLive,
              options.onlyIfExpired,
              options.skipFetch,
              // @ts-expect-error fix later
              options.mergeResults,
              options.onCompleted,
              options.onSuccess,
              options.onError
            ) as Promise<QueryResult<R>>
          },
          /**
           * Performs a mutation, aborting previous one with the same mutation key. Returns result only if finished succesfully.
           */
          mutate: <MK extends keyof (MP & MR)>(options: MutateOptions<N, T, QP, QR, MP, MR, MK>) => {
            type R = MK extends keyof (MP | MR) ? MR[MK] : never

            return mutateImpl(
              'mutate',
              store,
              cache,
              actions,
              selectors,
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
      }

      // doc-header createCache result
      return {
        /** Keeps all options, passed while creating the cache. */
        cache,
        /** Reducer of the cache, should be added to redux/zustand store. */
        reducer,
        // doc-header
        actions: {
          /** Updates query state, and optionally merges entity changes in a single action. */
          updateQueryStateAndEntities,
          /** Updates mutation state, and optionally merges entity changes in a single action. */
          updateMutationStateAndEntities,
          /** Merges EntityChanges to the state. */
          mergeEntityChanges,
          /** Invalidates query states. */
          invalidateQuery,
          /** Clears states for provided query keys and cache keys.
           * If cache key for query key is not provided, the whole state for query key is cleared. */
          clearQueryState,
          /** Clears states for provided mutation keys. */
          clearMutationState,
          /** Replaces cache state with initial, optionally merging with provided state. Doesn't cancel running fetches and should be used with caution. */
          clearCache,
        },
        // doc-header
        selectors: {
          /** This is a cacheStateSelector from createCache options, or default one if was not provided. */
          selectCacheState,
          /** Selects query state. */
          selectQueryState,
          /** Selects query latest result. */
          selectQueryResult,
          /** Selects query loading state. */
          selectQueryLoading,
          /** Selects query latest error. */
          selectQueryError,
          /** Selects query latest params. */
          selectQueryParams,
          /** Selects query latest expiresAt. */
          selectQueryExpiresAt,
          /** Selects mutation state. */
          selectMutationState,
          /** Selects mutation latest result. */
          selectMutationResult,
          /** Selects mutation loading state. */
          selectMutationLoading,
          /** Selects mutation latest error. */
          selectMutationError,
          /** Selects mutation latest params. */
          selectMutationParams,
          /** Selects entity by id and typename. */
          selectEntityById,
          /** Selects all entities. */
          selectEntities,
          /** Selects all entities of provided typename. */
          selectEntitiesByTypename,
        },
        // doc-header
        hooks: {
          /** Returns memoized object with query and mutate functions. Memoization dependency is the store. */
          useClient: () => {
            const store = cache.storeHooks.useStore()
            return useMemo(() => createClient(store), [store])
          },
          /** Fetches query when params change and subscribes to query state changes (subscription depends on `selectorComparer`). */
          useQuery: <QK extends keyof (QP & QR)>(
            options: Parameters<typeof useQuery<N, T, QP, QR, MP, MR, QK>>[3]
          ) => useQuery(cache, actions, selectors, options),
          /** Subscribes to provided mutation state and provides mutate function. */
          useMutation: <MK extends keyof (MP & MR)>(
            options: Parameters<typeof useMutation<N, T, QP, QR, MP, MR, MK>>[3]
          ) => useMutation(cache, actions, selectors, options, abortControllers),
          /** useSelector + selectEntityById. */
          useSelectEntityById: <TN extends keyof T>(
            id: Key | null | undefined,
            typename: TN
          ): T[TN] | undefined => {
            return cache.storeHooks.useSelector((state) => selectEntityById(state, id, typename))
          },
        },
        // doc-header
        utils: {
          /** Creates client by providing the store. Can be used when the store is a singleton - to not use a useClient hook for getting the client, but import it directly. */
          createClient,
          /** Generates the initial state by calling a reducer. Not needed for redux — it already generates it the same way when creating the store. */
          getInitialState: () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return reducer(undefined, EMPTY_OBJECT as any)
          },
          /**
           * Apply changes to the entities map.
           * Returns `undefined` if nothing to change, otherwise new `EntitiesMap<T>` with applied changes.
           * Uses deep comparison if `deepComparisonEnabled` option is `true`.
           * Performs additional checks for intersections if `additionalValidation` option is `true`, and prints warnings if finds any issues.
           */
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

// doc-ignore
/** Creates reducer, actions and hooks for managing queries and mutations. */
export const createCache = withTypenames().createCache
