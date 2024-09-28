export {createCache} from './createCache'
export type {ReduxCacheState} from './createCacheReducer'
export * from './types'
export {
  defaultGetCacheKey,
  DEFAULT_QUERY_MUTATION_STATE as defaultQueryMutationState,
} from './utilsAndConstants'

// Backlog

// ! high (1.0.0)
// key -> query
// rca -> vite
// defaults
// remove cachePolicy? make skip/enabled a function? skip -> enabled/shouldFetch?
// optional typenames: {} as Typenames
// remove mergeResults? bcs store is passed to queries/mutations
// remove undefined optional fields & emtpy states
// generate full api docs

// ! medium
// optimistic response
// make query key / cache key difference more clear in the docs
// check type of function arguments in dev
// allow multiple mutation with same keys?
// return back deserialize selector?
// selector for entities by typename
// callback option on error / success?
// refetch queries on mutation success
// remove query/mutation state when it finished without errors
// deep equal entities while merging state
// make error type generic

// ! low
// custom useStore & useSelector to support multiple stores?
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
