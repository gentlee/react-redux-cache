import {createClient} from '../createClient'

export const initializeForRedux = (cache) => {
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
      createClient: (store) => createClient(privateCache, store, store),
    },
  }
}
