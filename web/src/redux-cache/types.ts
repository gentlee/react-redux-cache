// Common

export type Key = string | number | symbol

export type Dict<T> = Record<Key, T>

export type Optional<T, K extends keyof T> = Partial<Pick<T, K>> & Omit<T, K>

// Cache

export type Typenames<E = any> = Record<string, E>

export type Cache<
  T extends Typenames,
  Q extends Record<
    keyof Q,
    QueryInfo<T, ExtractQueryParams<Q[keyof Q]>, ExtractQueryResult<Q[keyof Q]>>
  >,
  M extends Record<keyof M, Mutation<T>>
> = {
  typenames: T
  queries: Q
  mutations: M
  options: CacheOptions
  cacheStateSelector: (state: any) => any
}

export type CacheOptions = {
  runtimeErrorChecksEnabled: boolean
  logsEnabled: boolean
}

export type EntitiesMap<T> = Record<keyof T, Dict<T[keyof T]>>

// Query

export type QueryInfo<T extends Typenames, P, D> = {
  query: (params: P) => Promise<QueryResponse<T, D>>
  cacheOptions?: QueryCacheOptions | QueryCachePolicy
  dataSelector?: (state: any, params: P) => D // TODO resultSelector?
  mergeResults?: (
    oldResult: D | undefined,
    newResult: D,
    newEntities?: Partial<EntitiesMap<T>>
  ) => D
  getCacheKey?: (params?: P) => string
  getParamsKey?: (params?: P) => string | number // TODO why number?
}

export type QueryCachePolicy = 'cache-first' | 'cache-and-network'

export type QueryCacheOptions = {
  policy: QueryCachePolicy
  cacheQueryState: boolean
  cacheEntities: boolean
}

export type QueryResponse<T, D> = {
  result: D
  entities?: Partial<EntitiesMap<T>>
}

export type ExtractQueryParams<T> = T extends QueryInfo<any, infer P, any> ? P : never

export type ExtractQueryResult<T> = T extends QueryInfo<any, any, infer R> ? R : never

// Mutation

export type Mutation<T extends Typenames, P = any, D = any> = (
  params: P,
  abortSignal: AbortSignal
) => Promise<MutationResponse<T, D>>

export type MutationCacheOptions = Pick<QueryCacheOptions, 'cacheEntities'> & {
  cacheMutationState: boolean
}

export type MutationResponse<T, D = any> = {
  result?: D
  entities?: Partial<EntitiesMap<T>>
}

export type ExtractMutationParams<M> = M extends Mutation<any, infer P, any> ? P : never

export type ExtractMutationResult<M> = M extends Mutation<any, any, infer R> ? R : never

// Query & Mutation

export type QueryMutationState<D> = {
  loading: boolean
  data?: D
  error?: Error
}
