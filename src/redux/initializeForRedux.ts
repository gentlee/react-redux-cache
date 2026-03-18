/* eslint-disable @typescript-eslint/no-unused-vars */

import {createClient} from '../createClient'
import type {
  AnyStore,
  Cache,
  CacheClient,
  CacheConfig,
  CacheOptions,
  CacheState,
  Dict,
  EntitiesMap,
  EntityChanges,
  EntityIds,
  Globals,
  Key,
  Mutable,
  MutateOptions,
  Mutation,
  MutationInfo,
  MutationResponse,
  MutationResult,
  MutationState,
  NormalizedMutation,
  NormalizedMutationResponse,
  NormalizedQuery,
  NormalizedQueryResponse,
  OptionalPartial,
  PartialEntitiesMap,
  Query,
  QueryInfo,
  QueryOptions,
  QueryResponse,
  QueryResult,
  QueryState,
  QueryStateComparer,
  ReduxStoreLike,
  Typenames,
  UseQueryOptions,
  UseSelector,
  ZustandStoreLike,
} from '../types'
import {CacheExtensions, CachePrivate, CacheToPrivate, InnerStore, StoreHooksPrivate} from '../typesPrivate'

/** Initializes cache for Redux, returning reducer, actions and utils. */
export const initializeForRedux = <N extends string, SK extends string, T extends Typenames, QP, QR, MP, MR>(
  cache: Cache<N, SK, T, QP, QR, MP, MR>,
) => {
  const privateCache = cache as CachePrivate<N, SK, T, QP, QR, MP, MR>

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
    // doc-ignore
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
