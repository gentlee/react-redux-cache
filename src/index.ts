export {createCache, withTypenames} from './createCache'
export * from './types'
export {useQuerySelectorStateComparer} from './useQuery'
export {defaultGetCacheKey, FetchPolicy, isEmptyObject} from './utilsAndConstants'

// Backlog

// ! high (1.0.0-rc.0)
// optimistic response
// generate full api docs

// ! medium
// onCancel & onAbort
// remove empty entities and queries from state
// globals for success, completions and loading states?
// make query key / cache key difference more clear in the docs
// check type of function arguments in dev
// make skipFetch a function?
// example -> playground with changable options

// ! low
// make error type generic
// allow multiple mutation with same keys?
// easy access to all currently loading queries and mutations?
// cancellation to queries
// if mutation & query already loading - make options: last, throttle, debounce, parallel?
// add refresh interval for queries that are mounted?
// readonly types?
// proper types, remove as, any, todo
// add number of retries param?
