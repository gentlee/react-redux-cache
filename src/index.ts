export {createCache} from './createCache'
export type {ReduxCacheState} from './reducer'
export * from './types'
export {
  defaultGetCacheKey,
  DEFAULT_QUERY_MUTATION_STATE as defaultQueryMutationState,
} from './utilsAndConstants'

// Backlog

// ! high
// add not optimized not normalized example, and not normalized state example to readme
// try use skip for refreshing strategy?
// optimistic response
// make query key / cache key difference more clear in the docs, and/or rename queryKey -> query

// ! medium
// allow multiple mutation with same keys?
// type extractors from cache
// custom useStore
// return back deserialize selector?
// resultSelector - return also boolean that result is full enough or make cache policy as a function
// selector for entities by typename
// callback option on error / success?
// refetch queries on mutation success
// remove query/mutation state when it finished without errors
// deep equal entities while merging state
// make error type generic
// don't cache result if resultSelector set? throw error if mergeResult set with resultSelector?

// ! low
// access to currently loading queries and mutations?
// add params to the state?
// cancellation to queries
// if mutation & query alrady loading - make options: last, throttle, debounce, parallel?
// add time-to-live option, and/or time-to-refresh
// add refresh interval for queries that are mounted
// replace try/catch with returned error
// support any store, not only redux
// readonly types?
// proper types, remove as, any, todo
// add number of retries param?
