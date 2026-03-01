import {createClient} from './createClient'

export const initializeForRedux = (cache) => {
  var _a
  const privateCache = cache
  try {
    const useStore = require('react-redux').useStore
    const useSelector = require('react-redux').useSelector
    ;(_a = privateCache.storeHooks) !== null && _a !== void 0
      ? _a
      : (privateCache.storeHooks = {
          useStore,
          useSelector,
          useExternalStore: useStore,
        })
  } catch (e) {
    throw e
  }
  const {
    clearCache,
    clearMutationState,
    clearQueryState,
    invalidateQuery,
    mergeEntityChanges,
    updateMutationStateAndEntities,
    updateQueryStateAndEntities,
  } = privateCache.actions
  return {
    reducer: privateCache.reducer,
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
      createClient: (store) => createClient(privateCache, store, store),
    },
  }
}

export const setCustomStoreHooks = (cache, storeHooks) => {
  const privateCache = cache
  if (privateCache.storeHooks === undefined) {
    privateCache.storeHooks = storeHooks
  } else {
    privateCache.storeHooks.useStore = storeHooks.useStore
    privateCache.storeHooks.useSelector = storeHooks.useSelector
    privateCache.storeHooks.useExternalStore = storeHooks.useStore
  }
}
