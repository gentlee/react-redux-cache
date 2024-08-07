export {createCache} from './createCache'
export type {ReduxCacheState} from './reducer'
export * from './types'
export {
  defaultGetCacheKey,
  DEFAULT_QUERY_MUTATION_STATE as defaultQueryMutationState,
} from './utilsAndConstants'

// Backlog

// ! high
// screenshot of redux state to README
// optimistic response
// cover with tests
// try use skip for refreshing strategy?
// add example without normalization
// make query key / cache key difference more clear in the docs
// support multiple caches = reducers

// ! medium
// make named caches to produce named hooks, actions etc (same as slices in RTK)?
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
