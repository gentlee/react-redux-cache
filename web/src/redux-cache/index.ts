import {createCacheReducer} from './reducer'
import {Cache, CacheOptions, Optional, Typenames} from './types'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'
import {defaultCacheStateSelector, isDev} from './utilsAndConstants'

// Backlog

// ! high
// query key as string | function
// skip query option
// proper types, remove as, any, todo
// set options in cache, in hook and in refresh/mutate functions
// cover with tests
// documentation
// export actions for merging entities, result etc
// callback option on error / success?

// ! medium
// support hot reload
// cache policy as function? needsRefetch
// add verbose debug logs
// refetch queries on query / mutation success?
// remove state when it finished without errors
// set default options like getParams
// selectors for loading state of similar query or mutation (wihout using params as key)
// deep equal entities while merging state
// support multiple stores, override store as param
// add validation if entity is full enough
// optimistic response
// invalidate cache
// make error type generic

// ! low
// cancellation to queries
// if mutation & query alrady loading - make options: last, throttle, debounce, parallel?
// add time-to-live option, and/or time-to-refresh
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

export const createCache = <T extends Typenames, QR extends object, MR extends object>(
  cache: Optional<Cache<T, QR, MR>, 'options' | 'cacheStateSelector'>
) => {
  cache.options ??= {} as CacheOptions
  cache.options.runtimeErrorChecksEnabled ??= isDev
  cache.options.logsEnabled ??= isDev

  cache.cacheStateSelector ??= defaultCacheStateSelector

  return {
    cache: cache as Cache<T, QR, MR>,
    useQuery: <QK extends keyof QR>(options: Parameters<typeof useQuery<T, QR, QK>>[1]) =>
      useQuery(cache as Cache<T, QR, MR>, options),
    useMutation: <MK extends keyof MR>(options: Parameters<typeof useMutation<T, MR, MK>>[1]) =>
      useMutation(cache as Cache<T, QR, MR>, options),
    reducer: createCacheReducer(
      cache.typenames,
      cache.queries,
      cache.mutations,
      cache.options.logsEnabled
    ),
  }
}
