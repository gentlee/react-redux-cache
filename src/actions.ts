import type {EntityChanges, Key, QueryMutationState, Typenames} from './types'
import {PACKAGE_SHORT_NAME} from './utilsAndConstants'

const ACTION_PREFIX = `@${PACKAGE_SHORT_NAME}/`

export const updateQueryStateAndEntities = <T extends Typenames, QR, K extends keyof QR>(
  queryKey: K,
  queryCacheKey: Key,
  state?: Partial<QueryMutationState<QR[K]>>,
  entityChagnes?: EntityChanges<T>
) => ({
  type: `${ACTION_PREFIX}UPDATE_QUERY_STATE_AND_ENTITIES` as const,
  queryKey,
  queryCacheKey,
  state,
  entityChagnes,
})

export const updateMutationStateAndEntities = <T extends Typenames, MR, K extends keyof MR>(
  mutationKey: K,
  state?: Partial<QueryMutationState<MR[K]>>,
  entityChagnes?: EntityChanges<T>
) => ({
  type: `${ACTION_PREFIX}UPDATE_MUTATION_STATE_AND_ENTITIES` as const,
  mutationKey,
  state,
  entityChagnes,
})

export const mergeEntityChanges = <T extends Typenames>(changes: EntityChanges<T>) => ({
  type: `${ACTION_PREFIX}MERGE_ENTITY_CHANGES` as const,
  changes,
})

export const clearQueryState = <QR, K extends keyof QR>(queryKeys: {key: K; cacheKey?: Key}[]) => ({
  type: `${ACTION_PREFIX}CLEAR_QUERY_STATE` as const,
  queryKeys,
})

export const clearMutationState = <MR, K extends keyof MR>(mutationKeys: K[]) => ({
  type: `${ACTION_PREFIX}CLEAR_MUTATION_STATE` as const,
  mutationKeys,
})
