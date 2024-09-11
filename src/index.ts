export {createCache} from './createCache'
export type {ReduxCacheState} from './reducer'
export * from './types'
export {
  defaultGetCacheKey,
  DEFAULT_QUERY_MUTATION_STATE as defaultQueryMutationState,
} from './utilsAndConstants'

// Backlog

// ! high
// useQuery refresh with params use as client.query?
// update readme with how to use mergeResults for invalidating / updating caches?
// optimistic response
// make query key / cache key difference more clear in the docs, and/or rename queryKey -> query

// ! medium
// allow multiple mutation with same keys?
// type extractors from cache
// custom useStore
// return back deserialize selector?
// selector for entities by typename
// callback option on error / success?
// refetch queries on mutation success
// remove query/mutation state when it finished without errors
// deep equal entities while merging state
// make error type generic

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
