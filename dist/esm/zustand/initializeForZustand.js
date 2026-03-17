import {createClient as createClientImpl} from '../createClient'
import {logDebug, logWarn} from '../utilsAndConstants'

export const initializeForZustand = (cache, store) => {
  var _a, _b
  var _c
  const privateCache = cache
  const {
    config: {
      options: {logsEnabled},
    },
    reducer,
    actions,
    selectors: {selectCacheState},
    utils: {getRootState},
  } = privateCache
  const dispatch = (action) => {
    const state = reducer(selectCacheState(store.getState()), action)
    store.setState(getRootState(state))
  }
  const innerStore = {dispatch, getState: store.getState}
  ;(_a = privateCache.extensions) !== null && _a !== void 0 ? _a : (privateCache.extensions = {})
  if (privateCache.extensions.zustand !== undefined) {
    logWarn('initializeForZustand', 'Already initialized for Zustand')
  }
  ;(_b = (_c = privateCache.extensions).zustand) !== null && _b !== void 0 ? _b : (_c.zustand = {})
  privateCache.extensions.zustand.innerStore = innerStore
  privateCache.extensions.zustand.externalStore = store
  logsEnabled && logDebug('initializeForZustand', 'Initialized for Zustand')
  const {
    clearCache,
    clearMutationState,
    clearQueryState,
    invalidateQuery,
    mergeEntityChanges,
    updateMutationStateAndEntities,
    updateQueryStateAndEntities,
  } = Object.keys(actions).reduce((result, key) => {
    const fn = actions[key]
    result[key] = function () {
      const action = fn.apply(undefined, arguments)
      return dispatch(action)
    }
    return result
  }, {})
  const createClient = () => {
    return createClientImpl(privateCache, innerStore, store)
  }
  return {
    actions: {
      updateQueryStateAndEntities,
      updateMutationStateAndEntities,
      mergeEntityChanges,
      invalidateQuery,
      clearQueryState,
      clearMutationState,
      clearCache,
    },
    utils: {
      createClient,
    },
  }
}
