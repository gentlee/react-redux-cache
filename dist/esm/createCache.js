import {createActions} from './createActions'
import {createReducer} from './createReducer'
import {createSelectors} from './createSelectors'
import {
  applyEntityChanges,
  createStateComparer,
  EMPTY_OBJECT,
  FetchPolicy,
  IS_DEV,
  isRootState,
  logWarn,
  optionalUtils,
} from './utilsAndConstants'

export const withTypenames = () => {
  return {
    createCache: (partialConfig) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l
      var _m, _o, _p, _q, _r, _s, _t
      const abortControllers = new WeakMap()
      ;(_a = partialConfig.options) !== null && _a !== void 0 ? _a : (partialConfig.options = {})
      ;(_b = (_m = partialConfig.options).mutableCollections) !== null && _b !== void 0
        ? _b
        : (_m.mutableCollections = false)
      ;(_c = (_o = partialConfig.options).logsEnabled) !== null && _c !== void 0
        ? _c
        : (_o.logsEnabled = false)
      ;(_d = (_p = partialConfig.options).additionalValidation) !== null && _d !== void 0
        ? _d
        : (_p.additionalValidation = IS_DEV)
      ;(_e = (_q = partialConfig.options).deepComparisonEnabled) !== null && _e !== void 0
        ? _e
        : (_q.deepComparisonEnabled = true)
      ;(_f = partialConfig.globals) !== null && _f !== void 0 ? _f : (partialConfig.globals = {})
      ;(_g = (_r = partialConfig.globals).queries) !== null && _g !== void 0 ? _g : (_r.queries = {})
      ;(_h = (_s = partialConfig.globals.queries).fetchPolicy) !== null && _h !== void 0
        ? _h
        : (_s.fetchPolicy = FetchPolicy.NoCacheOrExpired)
      ;(_j = (_t = partialConfig.globals.queries).skipFetch) !== null && _j !== void 0
        ? _j
        : (_t.skipFetch = false)
      ;(_k = partialConfig.mutations) !== null && _k !== void 0 ? _k : (partialConfig.mutations = {})
      ;(_l = partialConfig.queries) !== null && _l !== void 0 ? _l : (partialConfig.queries = {})
      const config = partialConfig
      if (config.options.deepComparisonEnabled && !optionalUtils.deepEqual) {
        logWarn(
          'createCache',
          'optional dependency for fast-deep-equal was not provided, while deepComparisonEnabled option is true',
        )
      }
      setDefaultComparer(config.globals.queries)
      for (const queryKey in partialConfig.queries) {
        setDefaultComparer(partialConfig.queries[queryKey])
      }
      const cacheStateKey = config.cacheStateKey
      const selectCacheState = isRootState(cacheStateKey) ? (state) => state : (state) => state[cacheStateKey]
      const selectors = createSelectors(selectCacheState)
      const {
        selectQueryState,
        selectQueryResult,
        selectQueryLoading,
        selectQueryError,
        selectQueryParams,
        selectQueryExpiresAt,
        selectMutationState,
        selectMutationResult,
        selectMutationLoading,
        selectMutationError,
        selectMutationParams,
        selectEntityById,
        selectEntities,
        selectEntitiesByTypename,
      } = selectors
      const actions = createActions(config.name)
      const reducer = createReducer(actions, Object.keys(config.queries), config.options)
      const getRootState = isRootState(cacheStateKey)
        ? (state) => state
        : (state) => ({[cacheStateKey]: state})
      const getInitialState = () => {
        const state = reducer(undefined, EMPTY_OBJECT)
        return getRootState(state)
      }
      const cache = {
        config,
        selectors: {
          selectCacheState,
          selectQueryState,
          selectQueryResult,
          selectQueryLoading,
          selectQueryError,
          selectQueryParams,
          selectQueryExpiresAt,
          selectMutationState,
          selectMutationResult,
          selectMutationLoading,
          selectMutationError,
          selectMutationParams,
          selectEntityById,
          selectEntities,
          selectEntitiesByTypename,
        },
        utils: {
          applyEntityChanges: (entities, changes) => {
            return applyEntityChanges(entities, changes, config.options)
          },
          getInitialState,
        },
      }
      const privateCache = cache
      privateCache.reducer = reducer
      privateCache.actions = actions
      privateCache.abortControllers = abortControllers
      privateCache.utils.getRootState = getRootState
      return cache
    },
  }
}

const setDefaultComparer = (target) => {
  if (
    (target === null || target === void 0 ? void 0 : target.selectorComparer) != null &&
    typeof target.selectorComparer === 'object'
  ) {
    target.selectorComparer = createStateComparer(target.selectorComparer)
  }
}

export const createCache = withTypenames().createCache
