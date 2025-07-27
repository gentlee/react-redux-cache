import {useMemo} from 'react'

import {createActions} from './createActions'
import {createReducer} from './createReducer'
import {createSelectors} from './createSelectors'
import {mutate as mutateImpl} from './mutate'
import {query as queryImpl} from './query'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'
import {
  applyEntityChanges,
  createStateComparer,
  defaultGetCacheKey,
  EMPTY_OBJECT,
  FetchPolicy,
  IS_DEV,
  logWarn,
  optionalUtils,
} from './utilsAndConstants'

export const withTypenames = () => {
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
        : (_p.additionalValidation = IS_DEV)
      ;(_d = (_q = partialCache.options).deepComparisonEnabled) !== null && _d !== void 0
        ? _d
        : (_q.deepComparisonEnabled = true)
      ;(_e = partialCache.globals) !== null && _e !== void 0 ? _e : (partialCache.globals = {})
      ;(_f = (_r = partialCache.globals).queries) !== null && _f !== void 0 ? _f : (_r.queries = {})
      ;(_g = (_s = partialCache.globals.queries).fetchPolicy) !== null && _g !== void 0
        ? _g
        : (_s.fetchPolicy = FetchPolicy.NoCacheOrExpired)
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
      if (cache.options.deepComparisonEnabled && !optionalUtils.deepEqual) {
        logWarn(
          'createCache',
          'optional dependency for fast-deep-equal was not provided, while deepComparisonEnabled option is true'
        )
      }
      const setDefaultComparer = (target) => {
        if (
          (target === null || target === void 0 ? void 0 : target.selectorComparer) != null &&
          typeof target.selectorComparer === 'object'
        ) {
          target.selectorComparer = createStateComparer(target.selectorComparer)
        }
      }
      setDefaultComparer(cache.globals.queries)
      for (const queryKey in partialCache.queries) {
        setDefaultComparer(partialCache.queries[queryKey])
      }
      const selectors = Object.assign({selectCacheState: cache.cacheStateSelector}, createSelectors(cache))
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
      const actions = createActions(cache.name)
      const {
        updateQueryStateAndEntities,
        updateMutationStateAndEntities,
        mergeEntityChanges,
        invalidateQuery,
        clearQueryState,
        clearMutationState,
        clearCache,
      } = actions
      const reducer = createReducer(actions, Object.keys(cache.queries), cache.options)
      const createClient = (store) => {
        const client = {
          query: (options) => {
            var _a
            const {query: queryKey, params} = options
            const getCacheKey =
              (_a = cache.queries[queryKey].getCacheKey) !== null && _a !== void 0 ? _a : defaultGetCacheKey
            const cacheKey = getCacheKey(params)
            return queryImpl(
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
            return mutateImpl(
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
            return useMemo(() => createClient(store), [store])
          },
          useQuery: (options) => useQuery(cache, actions, selectors, options),
          useMutation: (options) => useMutation(cache, actions, selectors, options, abortControllers),
          useSelectEntityById: (id, typename) => {
            return cache.storeHooks.useSelector((state) => selectEntityById(state, id, typename))
          },
        },
        utils: {
          createClient,
          getInitialState: () => {
            return reducer(undefined, EMPTY_OBJECT)
          },
          applyEntityChanges: (entities, changes) => {
            return applyEntityChanges(entities, changes, cache.options)
          },
        },
      }
    },
  }
}

export const createCache = withTypenames().createCache
