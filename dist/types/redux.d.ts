import {Cache, ReduxStoreLike, StoreHooks, Typenames} from './types'

export declare const initializeForRedux: <N extends string, T extends Typenames, QP, QR, MP, MR>(
  cache: Cache<N, T, QP, QR, MP, MR>,
) => {
  /** Reducer of the cache, should be added to redux/zustand store. */
  reducer: (
    state: import('./types').CacheState<T, QP, QR, MP, MR> | undefined,
    action:
      | {
          type: `@rrc/${N}/updateQueryStateAndEntities`
          queryKey: keyof QP & keyof QR
          queryCacheKey: import('./types').Key
          state:
            | Partial<import('./types').QueryState<T, QP[keyof QP & keyof QR], QR[keyof QP & keyof QR]>>
            | undefined
          entityChanges: import('./types').EntityChanges<T> | undefined
        }
      | {
          type: `@rrc/${N}/updateMutationStateAndEntities`
          mutationKey: keyof MP & keyof MR
          state:
            | Partial<import('./types').MutationState<T, MP[keyof MP & keyof MR], MR[keyof MP & keyof MR]>>
            | undefined
          entityChanges: import('./types').EntityChanges<T> | undefined
        }
      | {
          type: `@rrc/${N}/mergeEntityChanges`
          changes: import('./types').EntityChanges<T>
        }
      | {
          type: `@rrc/${N}/invalidateQuery`
          queries: {
            query: keyof QP & keyof QR
            cacheKey?: import('./types').Key
            expiresAt?: number
          }[]
        }
      | {
          type: `@rrc/${N}/clearQueryState`
          queries: {
            query: keyof QP & keyof QR
            cacheKey?: import('./types').Key
          }[]
        }
      | {
          type: `@rrc/${N}/clearMutationState`
          mutationKeys: (keyof MP & keyof MR)[]
        }
      | {
          type: `@rrc/${N}/clearCache`
          stateToKeep: Partial<import('./types').CacheState<T, QP, QR, MP, MR>> | undefined
        },
  ) => import('./types').CacheState<T, QP, QR, MP, MR>
  actions: {
    /** Updates query state, and optionally merges entity changes in a single action. */
    updateQueryStateAndEntities: {
      <K extends keyof QP & keyof QR>(
        queryKey: K,
        queryCacheKey: import('./types').Key,
        state?: Partial<import('./types').QueryState<T, QP[K], QR[K]>> | undefined,
        entityChanges?: import('./types').EntityChanges<T> | undefined,
      ): {
        type: `@rrc/${N}/updateQueryStateAndEntities`
        queryKey: K
        queryCacheKey: import('./types').Key
        state: Partial<import('./types').QueryState<T, QP[K], QR[K]>> | undefined
        entityChanges: import('./types').EntityChanges<T> | undefined
      }
      type: `@rrc/${N}/updateQueryStateAndEntities`
    }
    /** Updates mutation state, and optionally merges entity changes in a single action. */
    updateMutationStateAndEntities: {
      <K extends keyof MP & keyof MR>(
        mutationKey: K,
        state?: Partial<import('./types').MutationState<T, MP[K], MR[K]>> | undefined,
        entityChanges?: import('./types').EntityChanges<T> | undefined,
      ): {
        type: `@rrc/${N}/updateMutationStateAndEntities`
        mutationKey: K
        state: Partial<import('./types').MutationState<T, MP[K], MR[K]>> | undefined
        entityChanges: import('./types').EntityChanges<T> | undefined
      }
      type: `@rrc/${N}/updateMutationStateAndEntities`
    }
    /** Merges EntityChanges to the state. */
    mergeEntityChanges: {
      (changes: import('./types').EntityChanges<T>): {
        type: `@rrc/${N}/mergeEntityChanges`
        changes: import('./types').EntityChanges<T>
      }
      type: `@rrc/${N}/mergeEntityChanges`
    }
    /** Sets expiresAt to Date.now(). */
    invalidateQuery: {
      <K extends keyof QP & keyof QR>(
        queries: {
          query: K
          cacheKey?: import('./types').Key
          expiresAt?: number
        }[],
      ): {
        type: `@rrc/${N}/invalidateQuery`
        queries: {
          query: K
          cacheKey?: import('./types').Key
          expiresAt?: number
        }[]
      }
      type: `@rrc/${N}/invalidateQuery`
    }
    /** Clears states for provided query keys and cache keys.
     * If cache key for query key is not provided, the whole state for query key is cleared. */
    clearQueryState: {
      <K extends keyof QP & keyof QR>(
        queries: {
          query: K
          cacheKey?: import('./types').Key
        }[],
      ): {
        type: `@rrc/${N}/clearQueryState`
        queries: {
          query: K
          cacheKey?: import('./types').Key
        }[]
      }
      type: `@rrc/${N}/clearQueryState`
    }
    /** Clears states for provided mutation keys. */
    clearMutationState: {
      <K extends keyof MP & keyof MR>(
        mutationKeys: K[],
      ): {
        type: `@rrc/${N}/clearMutationState`
        mutationKeys: K[]
      }
      type: `@rrc/${N}/clearMutationState`
    }
    /** Replaces cache state with initial, optionally merging with provided state. Doesn't cancel running fetches and should be used with caution. */
    clearCache: {
      (stateToKeep?: Partial<import('./types').CacheState<T, QP, QR, MP, MR>> | undefined): {
        type: `@rrc/${N}/clearCache`
        stateToKeep: Partial<import('./types').CacheState<T, QP, QR, MP, MR>> | undefined
      }
      type: `@rrc/${N}/clearCache`
    }
  }
  utils: {
    /** Creates client by providing the store. Can be used when the store is a singleton for direct client import. */
    createClient: (store: ReduxStoreLike) => {
      query: <QK extends keyof QP | keyof QR>(
        options: import('./types').QueryOptions<T, QP, QR, QK>,
      ) => Promise<import('./types').QueryResult<QK extends keyof QP & keyof QR ? QR[QK] : never>>
      mutate: <MK extends keyof MP | keyof MR>(
        options: import('./types').MutateOptions<T, MP, MR, MK>,
      ) => Promise<import('./types').MutationResult<MK extends keyof MP & keyof MR ? MR[MK] : never>>
    }
  }
}

/** Can be used to override defaut hooks, imported from "react-redux" package. */
export declare const setCustomStoreHooks: (
  cache: Cache<any, any, any, any, any, any>,
  storeHooks: StoreHooks,
) => void
