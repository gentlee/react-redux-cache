// TODO
// 
// support multiple stores, override store as param
// remove state when it finished without errors
// add getUpdateTime option to check entities while merging
// add time to live option
// set options in cache, in hook and in refresh/mutate functions
// support infinite lists
// useLocalMutation - uses local component state, or make store option - redux or component state or context? 1 version: redux only
// set default options like getParams
// cancellation
// if mutation & query alrady loading - make options: last, throttle, debounce, parallel?
// selectors for loading state of similar query or mutation (wihout using params as key)
// deep equal entities while merging state
// replace try/catch with returned error

export * from './reducer'
export * from './types'
export * from './useMutation'
export * from './useQuery'
export * from './utilsAndConstants'









