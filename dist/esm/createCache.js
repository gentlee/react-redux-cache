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
      var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o
      var _p, _q, _r, _s, _t, _u, _v
      const abortControllers = new WeakMap()
      ;(_a = partialCache.options) !== null && _a !== void 0 ? _a : (partialCache.options = {})
      ;(_b = (_p = partialCache.options).mutableCollections) !== null && _b !== void 0
        ? _b
        : (_p.mutableCollections = false)
      ;(_c = (_q = partialCache.options).logsEnabled) !== null && _c !== void 0
        ? _c
        : (_q.logsEnabled = false)
      ;(_d = (_r = partialCache.options).additionalValidation) !== null && _d !== void 0
        ? _d
        : (_r.additionalValidation = IS_DEV)
      ;(_e = (_s = partialCache.options).deepComparisonEnabled) !== null && _e !== void 0
        ? _e
        : (_s.deepComparisonEnabled = true)
      ;(_f = partialCache.globals) !== null && _f !== void 0 ? _f : (partialCache.globals = {})
      ;(_g = (_t = partialCache.globals).queries) !== null && _g !== void 0 ? _g : (_t.queries = {})
      ;(_h = (_u = partialCache.globals.queries).fetchPolicy) !== null && _h !== void 0
        ? _h
        : (_u.fetchPolicy = FetchPolicy.NoCacheOrExpired)
      ;(_j = (_v = partialCache.globals.queries).skipFetch) !== null && _j !== void 0
        ? _j
        : (_v.skipFetch = false)
      ;(_k = partialCache.cacheStateSelector) !== null && _k !== void 0
        ? _k
        : (partialCache.cacheStateSelector = (state) => state[cache.name])
      ;(_l = partialCache.mutations) !== null && _l !== void 0 ? _l : (partialCache.mutations = {})
      ;(_m = partialCache.queries) !== null && _m !== void 0 ? _m : (partialCache.queries = {})
      partialCache.abortControllers = abortControllers
      try {
        ;(_o = partialCache.storeHooks) !== null && _o !== void 0
          ? _o
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
          useEntitiesByTypename: (typename) => {
            if (cache.options.mutableCollections) {
              cache.storeHooks.useSelector((state) => {
                var _a
                return (_a = selectEntitiesByTypename(state, typename)) === null || _a === void 0
                  ? void 0
                  : _a._changeKey
              })
            }
            return cache.storeHooks.useSelector((state) => selectEntitiesByTypename(state, typename))
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
