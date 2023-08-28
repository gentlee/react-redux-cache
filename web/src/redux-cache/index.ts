
import { Dict, InMemoryCache } from './types'
import { Query } from './useQuery'
import { isDev } from './utilsAndConstants'

// TODO
 
// ! high
// move options to cache creation
// proper types
// set options in cache, in hook and in refresh/mutate functions
// cover with tests
// documentation

// ! medium
// add verbose debug logs
// remove state when it finished without errors
// set default options like getParams
// selectors for loading state of similar query or mutation (wihout using params as key)
// deep equal entities while merging state
// support multiple stores, override store as param
// add validation if entity is full enough

// ! low
// cancellation to queries
// if mutation & query alrady loading - make options: last, throttle, debounce, parallel?
// add time-to-live option
// add getUpdateTime option to check entities while merging
// useLocalMutation - uses local component state, or make store option - redux or component state or context? 1 version: redux only
// replace try/catch with returned error
// support any store, not only redux

export * from './reducer'
export * from './types'
export * from './useMutation'
export * from './useQuery'
export * from './utilsAndConstants'

export const createCache = <
  RS extends Dict = Dict,
  D = unknown,
  QP = unknown,
  Q extends Record<string, Query<QP, D, RS>> = Record<string, Query<QP, D, RS>>,
  M extends Dict = Dict
>(cache: InMemoryCache<RS, D, QP, Q, M>) => {
  if (!cache.options) {
    cache.options = {
      isDev
    }
  }
  return cache
}







