import {Cache, CacheState, Typenames, ZustandStoreLike} from './types'

export declare const initializeForZustand: <
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  S = unknown,
>(
  cache: Cache<N, T, QP, QR, MP, MR>,
  store: ZustandStoreLike<S>,
) => {
  actions: {
    /** Updates query state, and optionally merges entity changes in a single action. */
    updateQueryStateAndEntities: (
      queryKey: keyof QP & keyof QR,
      queryCacheKey: import('./types').Key,
      state?:
        | Partial<import('./types').QueryState<T, QP[keyof QP & keyof QR], QR[keyof QP & keyof QR]>>
        | undefined,
      entityChanges?: import('./types').EntityChanges<T> | undefined,
    ) => void
    /** Updates mutation state, and optionally merges entity changes in a single action. */
    updateMutationStateAndEntities: (
      mutationKey: keyof MP & keyof MR,
      state?:
        | Partial<import('./types').MutationState<T, MP[keyof MP & keyof MR], MR[keyof MP & keyof MR]>>
        | undefined,
      entityChanges?: import('./types').EntityChanges<T> | undefined,
    ) => void
    /** Merges EntityChanges to the state. */
    mergeEntityChanges: (changes: import('./types').EntityChanges<T>) => void
    /** Sets expiresAt to Date.now(). */
    invalidateQuery: (
      queries: {
        query: keyof QP & keyof QR
        cacheKey?: import('./types').Key
        expiresAt?: number
      }[],
    ) => void
    /** Clears states for provided query keys and cache keys.
     * If cache key for query key is not provided, the whole state for query key is cleared. */
    clearQueryState: (
      queries: {
        query: keyof QP & keyof QR
        cacheKey?: import('./types').Key
      }[],
    ) => void
    /** Clears states for provided mutation keys. */
    clearMutationState: (mutationKeys: (keyof MP & keyof MR)[]) => void
    /** Replaces cache state with initial, optionally merging with provided state. Doesn't cancel running fetches and should be used with caution. */
    clearCache: (stateToKeep?: Partial<CacheState<T, QP, QR, MP, MR>> | undefined) => void
  }
  utils: {
    /** Generates the initial state. */
    getInitialState: () => S
    /** Creates client by providing the store. Can be used when the store is a singleton for direct client import. */
    createClient: (store: ZustandStoreLike) => {
      query: <QK extends keyof QP | keyof QR>(
        options: import('./types').QueryOptions<T, QP, QR, QK>,
      ) => Promise<import('./types').QueryResult<QK extends keyof QP & keyof QR ? QR[QK] : never>>
      mutate: <MK extends keyof MP | keyof MR>(
        options: import('./types').MutateOptions<T, MP, MR, MK>,
      ) => Promise<import('./types').MutationResult<MK extends keyof MP & keyof MR ? MR[MK] : never>>
    }
  }
}
