// Disabling this to import unused types to remove import() from generated types.
/* eslint-disable @typescript-eslint/no-unused-vars */

import {createActions} from './createActions'
import {createReducer} from './createReducer'
import {createSelectors} from './createSelectors'
import {CachePrivate, InnerStore} from './private-types'
import type {
  AnyStore,
  Cache,
  CacheClient,
  CacheConfig,
  CacheOptions,
  CacheState,
  Dict,
  EntitiesMap,
  EntityChanges,
  EntityIds,
  Globals,
  Key,
  Mutable,
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
  ReduxStoreLike,
  StoreHooks,
  Typenames,
  UseQueryOptions,
  UseSelector,
  ZustandStoreLike,
} from './types'
import {
  applyEntityChanges,
  createStateComparer,
  defaultGetCacheKey,
  EMPTY_OBJECT,
  FetchPolicy,
  IS_DEV,
  isRootState,
  logWarn,
  optionalUtils,
} from './utilsAndConstants'

/**
 * Function to provide generic Typenames if normalization is needed - this is a Typescript limitation.
 * Returns object with createCache function with provided typenames.
 * @example
 * `const cache = withTypenames<MyTypenames>().createCache({...})`
 */
export const withTypenames = <WT extends Typenames = Typenames>() => {
  return {
    /** Creates reducer, actions and hooks for managing queries and mutations. */
    createCache: <
      N extends string,
      T extends Typenames = WT,
      QP = unknown,
      QR = unknown,
      MP = unknown,
      MR = unknown,
    >(
      partialConfig: OptionalPartial<
        Omit<CacheConfig<N, T, QP, QR, MP, MR>, 'globals'>,
        'options' | 'queries' | 'mutations' | 'cacheStateKey'
      > & {
        globals?: OptionalPartial<CacheConfig<N, T, QP, QR, MP, MR>['globals'], 'queries'>
      },
    ) => {
      type TypedConfig = CacheConfig<N, T, QP, QR, MP, MR>

      const abortControllers = new WeakMap<InnerStore, Record<Key, AbortController>>()

      // Provide all optional fields

      partialConfig.cacheStateKey ??= partialConfig.name
      partialConfig.options ??= {} as CacheOptions
      partialConfig.options.mutableCollections ??= false
      partialConfig.options.logsEnabled ??= false
      partialConfig.options.additionalValidation ??= IS_DEV
      partialConfig.options.deepComparisonEnabled ??= true
      partialConfig.globals ??= {}
      partialConfig.globals.queries ??= {} as Globals<T>['queries']
      partialConfig.globals.queries.fetchPolicy ??= FetchPolicy.NoCacheOrExpired
      partialConfig.globals.queries.skipFetch ??= false
      partialConfig.mutations ??= {} as TypedConfig['mutations']
      partialConfig.queries ??= {} as TypedConfig['queries']

      const config = partialConfig as TypedConfig

      // Validate options

      if (config.options.deepComparisonEnabled && !optionalUtils.deepEqual) {
        logWarn(
          'createCache',
          'optional dependency for fast-deep-equal was not provided, while deepComparisonEnabled option is true',
        )
      }

      // State comparers

      setDefaultComparer(config.globals.queries)
      for (const queryKey in partialConfig.queries) {
        // @ts-expect-error TODO fix types
        setDefaultComparer(partialConfig.queries[queryKey as keyof TypedConfig['queries']])
      }

      // Selectors

      const cacheStateKey = config.cacheStateKey
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const selectCacheState: (state: any) => CacheState<T, QP, QR, MP, MR> = isRootState(cacheStateKey)
        ? (state: CacheState<T, QP, QR, MP, MR>) => state
        : (state: {[cacheStateKey]: CacheState<T, QP, QR, MP, MR>}) => state[cacheStateKey]

      const selectors = createSelectors(selectCacheState)
      const {
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

      const actions = createActions<N, T, QP, QR, MP, MR>(config.name)

      // Reducer

      const reducer = createReducer<N, T, QP, QR, MP, MR>(
        actions,
        Object.keys(config.queries) as (keyof (QP | QR))[],
        config.options,
      )

      // doc-header createCache result
      const cache = {
        /** Keeps config, passed while creating the cache, with default values set. */
        config: config as TypedConfig,
        // doc-header
        selectors: {
          /** Selects cache state from root state. Depends on `cacheStateKey`. */
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
        utils: {
          /**
           * Apply changes to the entities map.
           * Returns `undefined` if nothing to change, otherwise new `EntitiesMap<T>` with applied changes.
           * Uses deep comparison if `deepComparisonEnabled` option is `true`.
           * Performs additional checks for intersections if `additionalValidation` option is `true`, and prints warnings if finds any issues.
           */
          applyEntityChanges: (
            entities: Parameters<typeof applyEntityChanges<T>>[0],
            changes: Parameters<typeof applyEntityChanges<T>>[1],
          ) => {
            return applyEntityChanges<T>(entities, changes, config.options)
          },
        },
      }

      // Set private fields

      const privateCache = cache as CachePrivate<N, T, QP, QR, MP, MR>
      privateCache.reducer = reducer
      privateCache.actions = actions
      privateCache.abortControllers = abortControllers

      return cache
    },
  }
}

const setDefaultComparer = <T extends Typenames, P, R>(
  target:
    | {
        selectorComparer?: QueryStateComparer<T, P, R> | (keyof QueryState)[]
      }
    | undefined,
) => {
  if (target?.selectorComparer != null && typeof target.selectorComparer === 'object') {
    target.selectorComparer = createStateComparer(target.selectorComparer)
  }
}

// doc-ignore
/** Creates reducer, actions and hooks for managing queries and mutations. */
export const createCache = withTypenames().createCache
