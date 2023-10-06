export type Key = string | number | symbol

export type Dict<T = unknown> = Record<Key, T>

export type Cache<T, Q, M> = {
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

export type QueryInfo<T, D, P> = {
  query: (params: P) => Promise<QueryResponse<T, D>>
  cacheOptions?: QueryCacheOptions | QueryCachePolicy
  dataSelector?: (state: any, params: P) => D // TODO resultSelector?
  mergeResults?: (oldResult: D | undefined, newResult: D, newEntities: EntitiesMap<T>) => D
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
  entities: Partial<EntitiesMap<T>>
}

export type MutationCacheOptions = Pick<QueryCacheOptions, 'cacheEntities'> & {
  cacheMutationState: boolean
}

export type MutationResponse<T, D = any> = {
  result?: D
  entities: Partial<EntitiesMap<T>>
}

export type QueryMutationState<D> = {
  loading: boolean
  data?: D
  error?: Error
}

export type ExtractQueryResult<T> = T extends QueryInfo<any, infer D, any> ? D : never

export type ExtractQueryParams<T> = T extends QueryInfo<any, any, infer P> ? P : never

export type ExtractMutationResult<T> = T extends (params: any) => Promise<infer R> ? R : never

export type ExtractMutationParams<T> = T extends (params: infer P) => Promise<any> ? P : never
