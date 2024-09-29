export {createCache, withTypenames} from './createCache'
export type {ReduxCacheState} from './createCacheReducer'
export * from './types'
export {
  defaultGetCacheKey,
  DEFAULT_QUERY_MUTATION_STATE as defaultQueryMutationState,
} from './utilsAndConstants'

// Backlog

// ! high (1.0.0)
// rca -> vite
// defaults
// remove cachePolicy? make skip/enabled a function? skip -> enabled/shouldFetch?
// remove undefined optional fields & emtpy states. remove mutation state when it finished without errors
// generate full api docs

// ! medium
// optimistic response
// make query key / cache key difference more clear in the docs
// check type of function arguments in dev

// ! low
// make error type generic
// allow multiple mutation with same keys?
// custom useStore & useSelector to support multiple stores?
// easy access to all currently loading queries and mutations?
// cancellation to queries
// if mutation & query already loading - make options: last, throttle, debounce, parallel?
// add refresh interval for queries that are mounted
// readonly types?
// proper types, remove as, any, todo
// add number of retries param?
