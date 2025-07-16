import {PACKAGE_SHORT_NAME} from './utilsAndConstants'

export const createActions = (name) => {
  const actionPrefix = `@${PACKAGE_SHORT_NAME}/${name}/`
  const updateQueryStateAndEntitiesType = `${actionPrefix}updateQueryStateAndEntities`
  const updateQueryStateAndEntities = (queryKey, queryCacheKey, state, entityChanges) => ({
    type: updateQueryStateAndEntitiesType,
    queryKey,
    queryCacheKey,
    state,
    entityChanges,
  })
  updateQueryStateAndEntities.type = updateQueryStateAndEntitiesType
  const updateMutationStateAndEntitiesType = `${actionPrefix}updateMutationStateAndEntities`
  const updateMutationStateAndEntities = (mutationKey, state, entityChanges) => ({
    type: updateMutationStateAndEntitiesType,
    mutationKey,
    state,
    entityChanges,
  })
  updateMutationStateAndEntities.type = updateMutationStateAndEntitiesType
  const mergeEntityChangesType = `${actionPrefix}mergeEntityChanges`
  const mergeEntityChanges = (changes) => ({
    type: mergeEntityChangesType,
    changes,
  })
  mergeEntityChanges.type = mergeEntityChangesType
  const invalidateQueryType = `${actionPrefix}invalidateQuery`
  const invalidateQuery = (queries) => ({
    type: invalidateQueryType,
    queries,
  })
  invalidateQuery.type = invalidateQueryType
  const clearQueryStateType = `${actionPrefix}clearQueryState`
  const clearQueryState = (queries) => ({
    type: clearQueryStateType,
    queries,
  })
  clearQueryState.type = clearQueryStateType
  const clearMutationStateType = `${actionPrefix}clearMutationState`
  const clearMutationState = (mutationKeys) => ({
    type: clearMutationStateType,
    mutationKeys,
  })
  clearMutationState.type = clearMutationStateType
  const clearCacheType = `${actionPrefix}clearCache`
  const clearCache = (stateToKeep) => ({
    type: clearCacheType,
    stateToKeep,
  })
  clearCache.type = clearCacheType
  return {
    updateQueryStateAndEntities,
    updateMutationStateAndEntities,
    mergeEntityChanges,
    invalidateQuery,
    clearQueryState,
    clearMutationState,
    clearCache,
  }
}
