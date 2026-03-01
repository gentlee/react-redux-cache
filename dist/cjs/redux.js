'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
exports.setCustomStoreHooks = exports.initializeForRedux = void 0
const createClient_1 = require('./createClient')
const initializeForRedux = (cache) => {
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
      createClient: (store) => (0, createClient_1.createClient)(privateCache, store, store),
    },
  }
}
exports.initializeForRedux = initializeForRedux
const setCustomStoreHooks = (cache, storeHooks) => {
  const privateCache = cache
  if (privateCache.storeHooks === undefined) {
    privateCache.storeHooks = storeHooks
  } else {
    privateCache.storeHooks.useStore = storeHooks.useStore
    privateCache.storeHooks.useSelector = storeHooks.useSelector
    privateCache.storeHooks.useExternalStore = storeHooks.useStore
  }
}
exports.setCustomStoreHooks = setCustomStoreHooks
