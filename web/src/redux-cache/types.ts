// Common

import type {ReduxCacheState, createCacheReducer} from './reducer'

export type Key = string | number | symbol

export type Dict<T> = Record<Key, T>

export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>

/** Entity changes to be merged to redux state. */
export type EntityChanges<T extends Typenames> = {
  /** Entities that will be merged with existing. */
  merge?: Partial<PartialEntitiesMap<T>>
  /** Entities that will replace existing. */
  replace?: Partial<EntitiesMap<T>>
  /** Ids of entities that will be removed.  */
  remove?: Partial<EntityIds<T>>

  /** Alias for `merge` to support normalizr. */
  entities?: EntityChanges<T>['merge']
}

// Cache

/** Record of typename and its corresponding entity type */
export type Typenames = Record<string, object>

export type Cache<T extends Typenames, QR extends object, MR extends object> = {
  typenames: T
  queries: {
    [QK in keyof QR]: QueryInfo<
      T,
      any,
      QR[QK],
      ReturnType<ReturnType<typeof createCacheReducer<T, QR, MR>>>
    >
  }
  mutations: {[MK in keyof MR]: MutationInfo<T, any, MR[MK]>}
  options: CacheOptions
  /** Returns cache state from redux root state. */
  cacheStateSelector: (state: any) => ReduxCacheState<T, QR, MR>
}

export type CacheOptions = {
  /**
   * Enables validation of package function arguments. Recommened to enable in dev/testing mode.
   * Default is true in dev mode.
   * */
  validateFunctionArguments: boolean
  /**
   * Enables validation of package hook arguments. Recommened to enable in dev/testing mode and disable in production.
   * Should be disabled with hot reloading.
   * Default is true in dev mode without hot reloading.
   * */
  validateHookArguments: boolean
  /**
   * Enable console logs.
   * Default is true in dev mode.
   */
  logsEnabled: boolean
}

export type PartialEntitiesMap<T extends Typenames> = {[K in keyof T]: Dict<Partial<T[K]>>}

export type EntitiesMap<T extends Typenames> = {[K in keyof T]: Dict<T[K] | undefined>}

export type EntityIds<T extends Typenames> = {[K in keyof T]: Key[]}

// Query

export type Query<T extends Typenames, P, R> = (params: P) => Promise<QueryResponse<T, R>>

/** Helper to get QueryInfo from query */
export type GetQueryInfo<Q extends Query<any, any, any>, S = any> = Q extends Query<
  infer T,
  infer P,
  infer R
>
  ? QueryInfo<T, P, R, S>
  : never

export type QueryInfo<T extends Typenames, P, R, S> = {
  query: Query<T, P, R>
  cacheOptions?: QueryCacheOptions | QueryCachePolicy
  /**
   * Custom selector for query result from redux state.
   * Also used by cache policy to determine if fetch needed.
   * */
  resultSelector?: (state: S, params: P) => R | undefined
  /** Merges results before saving to the store. */
  mergeResults?: (
    oldResult: R | undefined,
    response: QueryResponse<T, R>,
    params: P | undefined
  ) => R
  /**
   * Cache key is used as a key of query state in queries map. Each key has its own query state.
   * Default implementation is equal to `getParamsKey`.
   * */
  getCacheKey?: (params?: P) => Key
  /**
   * Params key is used for determining if parameters were changed and fetch is needed.
   * Default implementation uses `JSON.stringify` of parameters.
   * */
  getParamsKey?: (params?: P) => Key
}

/**
 * @param cache-first for each params key fetch is not called if cache exists.
 * @param cache-and-fetch for each params key result is taken from cache and fetch is called.
 */
export type QueryCachePolicy = 'cache-first' | 'cache-and-fetch'

export type QueryCacheOptions = {
  /**
   * @param cache-first for each params key fetch is not called if cache exists.
   * @param cache-and-fetch for each params key result is taken from cache and fetch is called.
   */
  policy: QueryCachePolicy
  /** If `false`, query state is not saved in the store. Default is `true`. */
  cacheQueryState: boolean
  /** If `false`, entities from response are not saved to the store. Default is `true`. */
  cacheEntities: boolean
}

export type QueryResponse<T extends Typenames, R> = EntityChanges<T> & {
  /** Normalized result of a query. */
  result: R
}

// Mutation

export type Mutation<T extends Typenames, P, R> = (
  params: P,
  /** Signal is aborted for current mutation when the same mutation was called once again. */
  abortSignal: AbortSignal
) => Promise<MutationResponse<T, R>>

export type MutationInfo<T extends Typenames, P, R> = {
  mutation: Mutation<T, P, R>
  cacheOptions?: MutationCacheOptions
}

export type MutationCacheOptions = Pick<QueryCacheOptions, 'cacheEntities'> & {
  /** If `false`, mutation state is not saved in the store. Default is `true`. */
  cacheMutationState: boolean
}

export type MutationResponse<T extends Typenames, R> = EntityChanges<T> & {
  /** Normalized result of a mutation. */
  result?: R
}

// Query & Mutation

export type QueryMutationState<R> = {
  /** `true` when query or mutation is currently in progress. */
  loading: boolean
  /** Result of the latest successfull query response. */
  result?: R
  /** Error of the latest response. */
  error?: Error
}
