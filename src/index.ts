export {createCache} from './createCache'
export type {ReduxCacheState} from './reducer'
export * from './types'
export {defaultGetCacheKey, defaultQueryMutationState} from './utilsAndConstants'

// Backlog

// ! high
// cover with tests

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
// optimistic response
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
