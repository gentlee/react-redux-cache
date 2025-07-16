import {EMPTY_OBJECT} from './utilsAndConstants'

export const createSelectors = (cache) => {
  const selectEntityById = (state, id, typename) => {
    var _a
    return id == null
      ? undefined
      : (_a = cache.cacheStateSelector(state).entities[typename]) === null || _a === void 0
      ? void 0
      : _a[id]
  }
  const selectQueryState = (state, query, cacheKey) => {
    var _a
    return (_a = cache.cacheStateSelector(state).queries[query][cacheKey]) !== null && _a !== void 0
      ? _a
      : EMPTY_OBJECT
  }
  const selectMutationState = (state, mutation) => {
    var _a
    return (_a = cache.cacheStateSelector(state).mutations[mutation]) !== null && _a !== void 0
      ? _a
      : EMPTY_OBJECT
  }
  return {
    selectQueryState,
    selectQueryResult: (state, query, cacheKey) => {
      return selectQueryState(state, query, cacheKey).result
    },
    selectQueryLoading: (state, query, cacheKey) => {
      var _a
      return (_a = selectQueryState(state, query, cacheKey).loading) !== null && _a !== void 0 ? _a : false
    },
    selectQueryError: (state, query, cacheKey) => {
      return selectQueryState(state, query, cacheKey).error
    },
    selectQueryParams: (state, query, cacheKey) => {
      return selectQueryState(state, query, cacheKey).params
    },
    selectQueryExpiresAt: (state, query, cacheKey) => {
      return selectQueryState(state, query, cacheKey).expiresAt
    },
    selectMutationState,
    selectMutationResult: (state, mutation) => {
      return selectMutationState(state, mutation).result
    },
    selectMutationLoading: (state, mutation) => {
      var _a
      return (_a = selectMutationState(state, mutation).loading) !== null && _a !== void 0 ? _a : false
    },
    selectMutationError: (state, mutation) => {
      return selectMutationState(state, mutation).error
    },
    selectMutationParams: (state, mutation) => {
      return selectMutationState(state, mutation).params
    },
    selectEntityById,
    selectEntities: (state) => {
      return cache.cacheStateSelector(state).entities
    },
    selectEntitiesByTypename: (state, typename) => {
      return cache.cacheStateSelector(state).entities[typename]
    },
  }
}
