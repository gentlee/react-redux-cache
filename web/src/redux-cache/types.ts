// Common

import type {ReduxCacheState, createCacheReducer} from './reducer'

export type Key = string | number | symbol

export type Dict<T> = Record<Key, T>

export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>

export type Response<T extends Typenames> = {
  merge?: Partial<PartialEntitiesMap<T>>
  replace?: Partial<EntitiesMap<T>>
  remove?: Partial<EntityIds<T>>

  // Alias for `merge` to support normalizr.
  entities?: Response<T>['merge']
}

// Cache

export type Typenames<E = any> = Record<string, E>

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
  cacheStateSelector: (state: any) => ReduxCacheState<T, QR, MR>
}

export type CacheOptions = {
  runtimeErrorChecksEnabled: boolean
  logsEnabled: boolean
}

export type PartialEntitiesMap<T extends Typenames> = {[K in keyof T]: Dict<Partial<T[K]>>}

export type EntitiesMap<T extends Typenames> = {[K in keyof T]: Dict<T[K]>}

export type EntityIds<T extends Typenames> = {[K in keyof T]: Key[]}

// Query

export type Query<T extends Typenames, P, D> = (params: P) => Promise<QueryResponse<T, D>>

export type QueryInfo<T extends Typenames, P, D, S> = {
  query: Query<T, P, D>
  cacheOptions?: QueryCacheOptions | QueryCachePolicy
  dataSelector?: (state: S, params: P) => D // TODO resultSelector?
  mergeResults?: (oldResult: D | undefined, response: QueryResponse<T, D>, params?: P) => D
  getCacheKey?: (params?: P) => string
  getParamsKey?: (params?: P) => string | number // TODO why number?
}

export type QueryCachePolicy = 'cache-first' | 'cache-and-network'

export type QueryCacheOptions = {
  policy: QueryCachePolicy
  cacheQueryState: boolean
  cacheEntities: boolean
}

export type QueryResponse<T extends Typenames, D> = Response<T> & {
  result: D
}

// Mutation

export type Mutation<T extends Typenames, P, D> = (
  params: P,
  abortSignal: AbortSignal
) => Promise<MutationResponse<T, D>>

export type MutationInfo<T extends Typenames, P, D> = {
  mutation: Mutation<T, P, D>
  cacheOptions?: MutationCacheOptions
}

export type MutationCacheOptions = Pick<QueryCacheOptions, 'cacheEntities'> & {
  cacheMutationState: boolean
}

export type MutationResponse<T extends Typenames, D> = Response<T> & {
  result?: D
}

export type ExtractMutationParams<
  M extends Record<keyof M, MutationInfo<any, any, any>>,
  MK extends keyof M
> = Parameters<M[MK]['mutation']>[0]

export type ExtractMutationResult<
  M extends Record<keyof M, MutationInfo<any, any, any>>,
  MK extends keyof M
> = Awaited<ReturnType<M[MK]['mutation']>> extends MutationResponse<any, infer R> ? R : undefined

// Query & Mutation

export type QueryMutationState<D> = {
  loading: boolean
  data?: D
  error?: Error
}
