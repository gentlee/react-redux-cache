import {createClient} from './createClient'
import {EMPTY_OBJECT, isRootState, logWarn} from './utilsAndConstants'

export const initializeForZustand = (cache, store) => {
  const privateCache = cache
  const {
    config: {cacheStateKey},
    reducer,
    actions,
    selectors: {selectCacheState},
  } = privateCache
  const getStateToMerge = isRootState(cacheStateKey)
    ? (state) => state
    : (state) => ({[cacheStateKey]: state})
  const dispatch = (action) => {
    const state = reducer(selectCacheState(store.getState()), action)
    store.setState(getStateToMerge(state))
  }
  if (privateCache.storeHooks !== undefined) {
    logWarn('initializeForZustand', 'Cache seems to be already initialized')
  }
  const innerStore = {dispatch, getState: store.getState}
  privateCache.storeHooks = {
    useStore: () => innerStore,
    useSelector: store,
    useExternalStore: () => store,
  }
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
  const getInitialState = () => {
    const {reducer} = cache
    const state = reducer(undefined, EMPTY_OBJECT)
    return getStateToMerge(state)
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
      getInitialState,
      createClient: (store) => createClient(privateCache, innerStore, store),
    },
  }
}
