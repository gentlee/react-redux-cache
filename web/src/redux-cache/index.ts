import {createCacheReducer} from './reducer'
import {
  Cache,
  CacheOptions,
  ExtractMutationResult,
  ExtractQueryParams,
  ExtractQueryResult,
  MutationResponse,
  QueryInfo,
} from './types'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'
import {defaultCacheStateSelector, isDev} from './utilsAndConstants'

// TODO

// ! high
// set options in cache, in hook and in refresh/mutate functions
// proper types, remove as any
// cover with tests
// documentation

// ! medium
// add verbose debug logs
// refetch queries on mutation?
// remove state when it finished without errors
// set default options like getParams
// selectors for loading state of similar query or mutation (wihout using params as key)
// deep equal entities while merging state
// support multiple stores, override store as param
// add validation if entity is full enough
// optimistic response

// ! low
// cancellation to queries
// if mutation & query alrady loading - make options: last, throttle, debounce, parallel?
// add time-to-live option
// add getUpdateTime option to check entities while merging
// useLocalMutation - uses local component state, or make store option - redux or component state or context? 1 version: redux only
// replace try/catch with returned error
// support any store, not only redux
// QueryInfo.defaultOptions

export * from './reducer'
export * from './types'
export * from './useMutation'
export * from './useQuery'
export * from './utilsAndConstants'

export const createCache = <
  T extends Record<string, any>,
  Q extends Record<
    keyof Q,
    QueryInfo<T, ExtractQueryResult<Q[keyof Q]>, ExtractQueryParams<Q[keyof Q]>>
  >,
  M extends Record<
    keyof M,
    (
      params: Parameters<M[keyof M]>[0],
      abortSignal: AbortSignal
    ) => Promise<MutationResponse<T, ExtractMutationResult<M[keyof M]>>>
  >
>(
  cache: Omit<Cache<T, Q, M>, 'options' | 'cacheStateSelector'> &
    Partial<Pick<Cache<T, Q, M>, 'options' | 'cacheStateSelector'>>
) => {
  cache.options ??= {} as CacheOptions
  cache.options.runtimeErrorChecksEnabled ??= isDev
  cache.options.logsEnabled ??= isDev

  cache.cacheStateSelector ??= defaultCacheStateSelector

  return {
    cache: cache as Cache<T, Q, M>,
    useQuery: (options: Parameters<typeof useQuery>[1]) =>
      // @ts-ignore TODO options
      useQuery(cache as Cache<T, Q, M>, options),
    useMutation: (options: Parameters<typeof useMutation>[1]) =>
      // @ts-ignore TODO options
      useMutation(cache as Cache<T, Q, M>, options),
    reducer: createCacheReducer(
      cache.typenames,
      cache.queries,
      cache.mutations,
      cache.options.logsEnabled
    ),
  }
}
