import type {EntityChanges, Key, QueryMutationState, Typenames} from './types'
import {PACKAGE_SHORT_NAME} from './utilsAndConstants'

export type ActionMap<N extends string, T extends Typenames, QR, MR> = ReturnType<
  typeof createActions<N, T, QR, MR>
>

export const createActions = <N extends string, T extends Typenames, QR, MR>(name: N) => {
  const actionPrefix = `@${PACKAGE_SHORT_NAME}/${name}/` as const

  const updateQueryStateAndEntitiesType = `${actionPrefix}updateQueryStateAndEntities` as const
  const updateQueryStateAndEntities = <K extends keyof QR>(
    queryKey: K,
    queryCacheKey: Key,
    state?: Partial<QueryMutationState<QR[K]>>,
    entityChagnes?: EntityChanges<T>
  ) => ({
    type: updateQueryStateAndEntitiesType,
    queryKey,
    queryCacheKey,
    state,
    entityChagnes,
  })
  updateQueryStateAndEntities.type = updateQueryStateAndEntitiesType

  const updateMutationStateAndEntitiesType = `${actionPrefix}updateMutationStateAndEntities` as const
  const updateMutationStateAndEntities = <K extends keyof MR>(
    mutationKey: K,
    state?: Partial<QueryMutationState<MR[K]>>,
    entityChagnes?: EntityChanges<T>
  ) => ({
    type: updateMutationStateAndEntitiesType,
    mutationKey,
    state,
    entityChagnes,
  })
  updateMutationStateAndEntities.type = updateMutationStateAndEntitiesType

  const mergeEntityChangesType = `${actionPrefix}mergeEntityChanges` as const
  const mergeEntityChanges = (changes: EntityChanges<T>) => ({
    type: mergeEntityChangesType,
    changes,
  })
  mergeEntityChanges.type = mergeEntityChangesType

  const clearQueryStateType = `${actionPrefix}clearQueryState` as const
  const clearQueryState = <K extends keyof QR>(queryKeys: {key: K; cacheKey?: Key}[]) => ({
    type: clearQueryStateType,
    queryKeys,
  })
  clearQueryState.type = clearQueryStateType

  const clearMutationStateType = `${actionPrefix}clearMutationState` as const
  const clearMutationState = <K extends keyof MR>(mutationKeys: K[]) => ({
    type: clearMutationStateType,
    mutationKeys,
  })
  clearMutationState.type = clearMutationStateType

  return {
    /** Updates query state, and optionally merges entity changes in a single action. */
    updateQueryStateAndEntities,
    /** Updates mutation state, and optionally merges entity changes in a single action. */
    updateMutationStateAndEntities,
    /** Merge EntityChanges to the state. */
    mergeEntityChanges,
    /** Clear states for provided query keys and cache keys.
     * If cache key for query key is not provided, the whole state for query key is cleared. */
    clearQueryState,
    /** Clear states for provided mutation keys. */
    clearMutationState,
  }
}
