import {createClient} from '../createClient'
import {Cache, ReduxStoreLike, Typenames} from '../types'
import {CachePrivate} from '../typesPrivate'

export const initializeForRedux = <N extends string, T extends Typenames, QP, QR, MP, MR>(
  cache: Cache<N, T, QP, QR, MP, MR>,
) => {
  const privateCache = cache as CachePrivate<N, T, QP, QR, MP, MR>

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
    /** Reducer of the cache, should be added to Redux store. */
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
