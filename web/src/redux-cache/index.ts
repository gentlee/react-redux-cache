import {createCacheReducer} from './reducer'
import {Cache, CacheOptions, Mutation, Optional, Query, Typenames} from './types'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'
import {defaultCacheStateSelector, isDev} from './utilsAndConstants'

// Backlog

// ! high
// export actions for merging entities, result, denormalize selector, invalidate cache
// documentation
// support hot reload
// cover with tests

// ! medium
// callback option on error / success?
// cache policy as function? needsRefetch
// add verbose debug logs
// refetch queries on query / mutation success?
// remove state when it finished without errors
// set default options like getParams
// selectors for loading state of similar query or mutation (wihout using params as key)
// deep equal entities while merging state
// support multiple stores
// add validation if entity is full enough
// optimistic response
// make error type generic
// proper types, remove as, any, todo

// ! low
// cancellation to queries
// if mutation & query alrady loading - make options: last, throttle, debounce, parallel?
// add time-to-live option, and/or time-to-refresh
// add getUpdateTime option to check entities while merging
// useLocalMutation - uses local component state, or make store option - redux or component state or context? 1 version: redux only
// replace try/catch with returned error
// support any store, not only redux
// QueryInfo.defaultOptions
// set options in refresh/mutate functions

export * from './reducer'
export * from './types'
export * from './useMutation'
export * from './useQuery'
export * from './utilsAndConstants'

export const createCache = <T extends Typenames, QR extends object, MR extends object>(
  cache: Optional<Cache<T, QR, MR>, 'options' | 'cacheStateSelector'>
) => {
  cache.options ??= {} as CacheOptions
  cache.options.runtimeErrorChecksEnabled ??= isDev
  cache.options.logsEnabled ??= isDev

  cache.cacheStateSelector ??= defaultCacheStateSelector

  return {
    cache: cache as Cache<T, QR, MR>,
    useQuery: <Q extends Query<T, any, any>>(options: Parameters<typeof useQuery<T, Q>>[1]) =>
      useQuery(cache as Cache<T, QR, MR>, options),
    useMutation: <M extends Mutation<T, any, any>>(
      options: Parameters<typeof useMutation<T, M>>[1]
    ) => useMutation(cache as Cache<T, QR, MR>, options),
    reducer: createCacheReducer(
      cache.typenames,
      cache.queries,
      cache.mutations,
      cache.options.logsEnabled
    ),
  }
}
