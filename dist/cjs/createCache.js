'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
exports.createCache = exports.withTypenames = void 0
const react_1 = require('react')
const createActions_1 = require('./createActions')
const createReducer_1 = require('./createReducer')
const createSelectors_1 = require('./createSelectors')
const mutate_1 = require('./mutate')
const query_1 = require('./query')
const useMutation_1 = require('./useMutation')
const useQuery_1 = require('./useQuery')
const utilsAndConstants_1 = require('./utilsAndConstants')

const withTypenames = () => {
  return {
    createCache: (partialCache) => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m
      var _o, _p, _q, _r, _s, _t
      const abortControllers = new WeakMap()
      ;(_a = partialCache.options) !== null && _a !== void 0 ? _a : (partialCache.options = {})
      ;(_b = (_o = partialCache.options).logsEnabled) !== null && _b !== void 0
        ? _b
        : (_o.logsEnabled = false)
      ;(_c = (_p = partialCache.options).additionalValidation) !== null && _c !== void 0
        ? _c
        : (_p.additionalValidation = utilsAndConstants_1.IS_DEV)
      ;(_d = (_q = partialCache.options).deepComparisonEnabled) !== null && _d !== void 0
        ? _d
        : (_q.deepComparisonEnabled = true)
      ;(_e = partialCache.globals) !== null && _e !== void 0 ? _e : (partialCache.globals = {})
      ;(_f = (_r = partialCache.globals).queries) !== null && _f !== void 0 ? _f : (_r.queries = {})
      ;(_g = (_s = partialCache.globals.queries).fetchPolicy) !== null && _g !== void 0
        ? _g
        : (_s.fetchPolicy = utilsAndConstants_1.FetchPolicy.NoCacheOrExpired)
      ;(_h = (_t = partialCache.globals.queries).skipFetch) !== null && _h !== void 0
        ? _h
        : (_t.skipFetch = false)
      ;(_j = partialCache.cacheStateSelector) !== null && _j !== void 0
        ? _j
        : (partialCache.cacheStateSelector = (state) => state[cache.name])
      ;(_k = partialCache.mutations) !== null && _k !== void 0 ? _k : (partialCache.mutations = {})
      ;(_l = partialCache.queries) !== null && _l !== void 0 ? _l : (partialCache.queries = {})
      partialCache.abortControllers = abortControllers
      try {
        ;(_m = partialCache.storeHooks) !== null && _m !== void 0
          ? _m
          : (partialCache.storeHooks = {
              useStore: require('react-redux').useStore,
              useSelector: require('react-redux').useSelector,
            })
      } catch (e) {
        throw e
      }
      const cache = partialCache
      if (cache.options.deepComparisonEnabled && !utilsAndConstants_1.optionalUtils.deepEqual) {
        console.warn(
          'react-redux-cache: optional dependency for fast-deep-equal was not provided, while deepComparisonEnabled option is true'
        )
      }
      const setDefaultComparer = (target) => {
        if (
          (target === null || target === void 0 ? void 0 : target.selectorComparer) != null &&
          typeof target.selectorComparer === 'object'
        ) {
          target.selectorComparer = (0, utilsAndConstants_1.createStateComparer)(target.selectorComparer)
        }
      }
      setDefaultComparer(cache.globals.queries)
      for (const queryKey in partialCache.queries) {
        setDefaultComparer(partialCache.queries[queryKey])
      }
      const selectors = Object.assign(
        {selectCacheState: cache.cacheStateSelector},
        (0, createSelectors_1.createSelectors)(cache)
      )
      const {
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
      } = selectors
      const actions = (0, createActions_1.createActions)(cache.name)
      const {
        updateQueryStateAndEntities,
        updateMutationStateAndEntities,
        mergeEntityChanges,
        invalidateQuery,
        clearQueryState,
        clearMutationState,
        clearCache,
      } = actions
      const reducer = (0, createReducer_1.createReducer)(actions, Object.keys(cache.queries), cache.options)
      const createClient = (store) => {
        const client = {
          query: (options) => {
            var _a
            const {query: queryKey, params} = options
            const getCacheKey =
              (_a = cache.queries[queryKey].getCacheKey) !== null && _a !== void 0
                ? _a
                : utilsAndConstants_1.defaultGetCacheKey
            const cacheKey = getCacheKey(params)
            return (0, query_1.query)(
              'query',
              store,
              cache,
              actions,
              selectors,
              queryKey,
              cacheKey,
              params,
              options.secondsToLive,
              options.onlyIfExpired,
              options.skipFetch,
              options.mergeResults,
              options.onCompleted,
              options.onSuccess,
              options.onError
            )
          },
          mutate: (options) => {
            return (0, mutate_1.mutate)(
              'mutate',
              store,
              cache,
              actions,
              selectors,
              options.mutation,
              options.params,
              abortControllers,
              options.onCompleted,
              options.onSuccess,
              options.onError
            )
          },
        }
        return client
      }
      return {
        cache,
        reducer,
        actions: {
          updateQueryStateAndEntities,
          updateMutationStateAndEntities,
          mergeEntityChanges,
          invalidateQuery,
          clearQueryState,
          clearMutationState,
          clearCache,
        },
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
        hooks: {
          useClient: () => {
            const store = cache.storeHooks.useStore()
            return (0, react_1.useMemo)(() => createClient(store), [store])
          },
          useQuery: (options) => (0, useQuery_1.useQuery)(cache, actions, selectors, options),
          useMutation: (options) =>
            (0, useMutation_1.useMutation)(cache, actions, selectors, options, abortControllers),
          useSelectEntityById: (id, typename) => {
            return cache.storeHooks.useSelector((state) => selectEntityById(state, id, typename))
          },
        },
        utils: {
          createClient,
          getInitialState: () => {
            return reducer(undefined, utilsAndConstants_1.EMPTY_OBJECT)
          },
          applyEntityChanges: (entities, changes) => {
            return (0, utilsAndConstants_1.applyEntityChanges)(entities, changes, cache.options)
          },
        },
      }
    },
  }
}
exports.withTypenames = withTypenames
exports.createCache = (0, exports.withTypenames)().createCache
