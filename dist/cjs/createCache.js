'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
exports.createCache = exports.withTypenames = void 0
const createActions_1 = require('./createActions')
const createReducer_1 = require('./createReducer')
const createSelectors_1 = require('./createSelectors')
const utilsAndConstants_1 = require('./utilsAndConstants')
const withTypenames = () => {
  return {
    createCache: (partialConfig) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m
      var _o, _p, _q, _r, _s, _t, _u
      const abortControllers = new WeakMap()
      ;(_a = partialConfig.cacheStateKey) !== null && _a !== void 0
        ? _a
        : (partialConfig.cacheStateKey = partialConfig.name)
      ;(_b = partialConfig.options) !== null && _b !== void 0 ? _b : (partialConfig.options = {})
      ;(_c = (_o = partialConfig.options).mutableCollections) !== null && _c !== void 0
        ? _c
        : (_o.mutableCollections = false)
      ;(_d = (_p = partialConfig.options).logsEnabled) !== null && _d !== void 0
        ? _d
        : (_p.logsEnabled = false)
      ;(_e = (_q = partialConfig.options).additionalValidation) !== null && _e !== void 0
        ? _e
        : (_q.additionalValidation = utilsAndConstants_1.IS_DEV)
      ;(_f = (_r = partialConfig.options).deepComparisonEnabled) !== null && _f !== void 0
        ? _f
        : (_r.deepComparisonEnabled = true)
      ;(_g = partialConfig.globals) !== null && _g !== void 0 ? _g : (partialConfig.globals = {})
      ;(_h = (_s = partialConfig.globals).queries) !== null && _h !== void 0 ? _h : (_s.queries = {})
      ;(_j = (_t = partialConfig.globals.queries).fetchPolicy) !== null && _j !== void 0
        ? _j
        : (_t.fetchPolicy = utilsAndConstants_1.FetchPolicy.NoCacheOrExpired)
      ;(_k = (_u = partialConfig.globals.queries).skipFetch) !== null && _k !== void 0
        ? _k
        : (_u.skipFetch = false)
      ;(_l = partialConfig.mutations) !== null && _l !== void 0 ? _l : (partialConfig.mutations = {})
      ;(_m = partialConfig.queries) !== null && _m !== void 0 ? _m : (partialConfig.queries = {})
      const config = partialConfig
      if (config.options.deepComparisonEnabled && !utilsAndConstants_1.optionalUtils.deepEqual) {
        ;(0, utilsAndConstants_1.logWarn)(
          'createCache',
          'optional dependency for fast-deep-equal was not provided, while deepComparisonEnabled option is true',
        )
      }
      setDefaultComparer(config.globals.queries)
      for (const queryKey in partialConfig.queries) {
        setDefaultComparer(partialConfig.queries[queryKey])
      }
      const cacheStateKey = config.cacheStateKey
      const selectCacheState = (0, utilsAndConstants_1.isRootState)(cacheStateKey)
        ? (state) => state
        : (state) => state[cacheStateKey]
      const selectors = (0, createSelectors_1.createSelectors)(selectCacheState)
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
      const actions = (0, createActions_1.createActions)(config.name)
      const reducer = (0, createReducer_1.createReducer)(actions, Object.keys(config.queries), config.options)
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
            return (0, utilsAndConstants_1.applyEntityChanges)(entities, changes, config.options)
          },
        },
      }
      const privateCache = cache
      privateCache.reducer = reducer
      privateCache.actions = actions
      privateCache.abortControllers = abortControllers
      return cache
    },
  }
}
exports.withTypenames = withTypenames
const setDefaultComparer = (target) => {
  if (
    (target === null || target === void 0 ? void 0 : target.selectorComparer) != null &&
    typeof target.selectorComparer === 'object'
  ) {
    target.selectorComparer = (0, utilsAndConstants_1.createStateComparer)(target.selectorComparer)
  }
}
exports.createCache = (0, exports.withTypenames)().createCache
