import {createClient} from './createClient'
import {CachePrivate, CacheToPrivate} from './private-types'
import {Cache, ReduxStoreLike, StoreHooks, Typenames} from './types'

export const initializeForRedux = <N extends string, T extends Typenames, QP, QR, MP, MR>(
  cache: Cache<N, T, QP, QR, MP, MR>,
) => {
  const privateCache = cache as CachePrivate<N, T, QP, QR, MP, MR>

  // Try/catch just for bunders like metro to consider this as optional dependency
  // eslint-disable-next-line no-useless-catch
  try {
    const useStore = require('react-redux').useStore
    const useSelector = require('react-redux').useSelector
    privateCache.storeHooks ??= {
      useStore,
      useSelector,
      useExternalStore: useStore,
    }
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
    /** Reducer of the cache, should be added to redux/zustand store. */
    reducer: privateCache.reducer,
    // doc-header
    actions: {
      /** Updates query state, and optionally merges entity changes in a single action. */
      updateQueryStateAndEntities,
      /** Updates mutation state, and optionally merges entity changes in a single action. */
      updateMutationStateAndEntities,
      /** Merges EntityChanges to the state. */
      mergeEntityChanges,
      /** Sets expiresAt to Date.now(). */
      invalidateQuery,
      /** Clears states for provided query keys and cache keys.
       * If cache key for query key is not provided, the whole state for query key is cleared. */
      clearQueryState,
      /** Clears states for provided mutation keys. */
      clearMutationState,
      /** Replaces cache state with initial, optionally merging with provided state. Doesn't cancel running fetches and should be used with caution. */
      clearCache,
    },
    // doc-header
    utils: {
      /** Creates client by providing the store. Can be used when the store is a singleton for direct client import. */
      createClient: (store: ReduxStoreLike) => createClient(privateCache, store, store),
    },
  }
}

/** Can be used to override defaut hooks, imported from "react-redux" package. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setCustomStoreHooks = (cache: Cache<any, any, any, any, any, any>, storeHooks: StoreHooks) => {
  const privateCache = cache as CacheToPrivate<typeof cache>

  if (privateCache.storeHooks === undefined) {
    privateCache.storeHooks = storeHooks
  } else {
    privateCache.storeHooks.useStore = storeHooks.useStore
    privateCache.storeHooks.useSelector = storeHooks.useSelector
    privateCache.storeHooks.useExternalStore = storeHooks.useStore
  }
}
