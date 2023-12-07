export {createCache} from './createCache'
export type {ReduxCacheState} from './reducer'
export * from './types'
export {defaultMutationCacheOptions} from './useMutation'
export {defaultQueryCacheOptions, queryCacheOptionsByPolicy} from './useQuery'
export {defaultGetParamsKey, defaultQueryMutationState} from './utilsAndConstants'

// Backlog

// ! high
// cover with tests

// ! medium
// allow multiple mutation with sam keys?
// type extractors from cache
// custom useStore
// return back deserialize selector?
// resultSelector - return also boolean that result is full enough
// selector for entities by typename
// provide call query/mutation function to call them without hooks, but with all state updates
// get typenames from schema? (useSelectDenormalized)
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
// make types readonly
// support changing query key?
// remove defaultState and keep values undefined?
// add params to the state?
// cancellation to queries
// if mutation & query alrady loading - make options: last, throttle, debounce, parallel?
// add time-to-live option, and/or time-to-refresh
// add getUpdateTime option to check entities while merging
// useLocalMutation - uses local component state, or make store option - redux or component state or context? 1 version: redux only
// replace try/catch with returned error
// support any store, not only redux
// QueryInfo.defaultOptions
// set options in refresh/mutate functions
// multiple reducers instead of 1?
// don't cache result if resultSelector set? throw error if mergeResult set with resultSelector?
