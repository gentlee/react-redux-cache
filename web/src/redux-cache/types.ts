// Common

import type {ReduxCacheState} from './reducer'

export type Key = string | number | symbol

export type Dict<T> = Record<Key, T>

export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>

export type Response<T extends Typenames> = {
  merge?: Partial<PartialEntitiesMap<T>>
  replace?: Partial<EntitiesMap<T>>
  remove?: Partial<EntityIds<T>>
}

// Cache

export type Typenames<E = any> = Record<string, E>

export type Cache<
  T extends Typenames,
  Q extends Record<keyof Q, QueryInfo<T, any, any>>,
  M extends Record<keyof M, MutationInfo<T, any, any>>
> = {
  typenames: T
  queries: Q
  mutations: M
  options: CacheOptions
  cacheStateSelector: (state: any) => ReduxCacheState<T, Q, M>
}

export type CacheOptions = {
  runtimeErrorChecksEnabled: boolean
  logsEnabled: boolean
}

export type PartialEntitiesMap<T> = Record<keyof T, Dict<Partial<T[keyof T]>>>

export type EntitiesMap<T> = Record<keyof T, Dict<T[keyof T]>>

export type EntityIds<T> = Record<keyof T, Key[]>

// Query

export type QueryInfo<T extends Typenames, P, D> = {
  query: (params: P) => Promise<QueryResponse<T, D>>
  cacheOptions?: QueryCacheOptions | QueryCachePolicy
  dataSelector?: (state: any, params: P) => D // TODO resultSelector?
  mergeResults?: (oldResult: D | undefined, response: QueryResponse<T, D>) => D
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

export type ExtractQueryParams<
  Q extends Record<keyof Q, QueryInfo<any, any, any>>,
  QK extends keyof Q
> = Parameters<Q[QK]['query']>[0]

export type ExtractQueryResult<
  Q extends Record<keyof Q, QueryInfo<any, any, any>>,
  QK extends keyof Q
> = Awaited<ReturnType<Q[QK]['query']>>['result']

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
> = Awaited<ReturnType<M[MK]['mutation']>>['result']

// Query & Mutation

export type QueryMutationState<D> = {
  loading: boolean
  data?: D
  error?: Error
}
