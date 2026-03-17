'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
exports.initializeForRedux = void 0
const createClient_1 = require('../createClient')
const initializeForRedux = (cache) => {
  const privateCache = cache
  const {
    actions: {
      clearCache,
      clearMutationState,
      clearQueryState,
      invalidateQuery,
      mergeEntityChanges,
      updateMutationStateAndEntities,
      updateQueryStateAndEntities,
    },
  } = privateCache
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
