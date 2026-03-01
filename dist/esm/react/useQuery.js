var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
import {useCallback, useEffect} from 'react'

import {query as queryImpl} from '../query'
import {
  createStateComparer,
  defaultGetCacheKey,
  EMPTY_OBJECT,
  logDebug,
  validateStoreHooks,
} from '../utilsAndConstants'

export const useQuery = (cache, useQueryOptions) => {
  var _a, _b, _c, _d, _e
  const {
    storeHooks,
    config: {queries, globals, options: configOptions},
    selectors: {selectQueryState},
  } = cache
  validateStoreHooks(storeHooks)
  const {
    query: queryKey,
    skipFetch = false,
    params,
    selectorComparer,
    fetchPolicy = (_a = queries[queryKey].fetchPolicy) !== null && _a !== void 0
      ? _a
      : globals.queries.fetchPolicy,
  } = useQueryOptions
  const queryInfo = queries[queryKey]
  const logsEnabled = configOptions.logsEnabled
  const getCacheKey = (_b = queryInfo.getCacheKey) !== null && _b !== void 0 ? _b : defaultGetCacheKey
  const comparer =
    selectorComparer === undefined
      ? (_d =
          (_c = queryInfo.selectorComparer) !== null && _c !== void 0
            ? _c
            : globals.queries.selectorComparer) !== null && _d !== void 0
        ? _d
        : defaultStateComparer
      : typeof selectorComparer === 'function'
        ? selectorComparer
        : createStateComparer(selectorComparer)
  const innerStore = storeHooks.useStore()
  const externalStore = storeHooks.useExternalStore()
  const cacheKey = getCacheKey(params)
  const performFetch = useCallback(
    (options) =>
      __awaiter(void 0, void 0, void 0, function* () {
        const paramsPassed = options && 'params' in options
        const {secondsToLive, mergeResults, onCompleted, onSuccess, onError} = useQueryOptions
        return yield queryImpl(
          'useQuery.fetch',
          innerStore,
          externalStore,
          cache,
          queryKey,
          paramsPassed ? getCacheKey(options.params) : cacheKey,
          paramsPassed ? options.params : params,
          options === null || options === void 0 ? void 0 : options.onlyIfExpired,
          false,
          secondsToLive,
          mergeResults,
          onCompleted,
          onSuccess,
          onError,
        )
      }),
    [innerStore, externalStore, queryKey, cacheKey],
  )
  const queryState =
    (_e = storeHooks.useSelector((state) => {
      return selectQueryState(state, queryKey, cacheKey)
    }, comparer)) !== null && _e !== void 0
      ? _e
      : EMPTY_OBJECT
  useEffect(() => {
    if (skipFetch) {
      logsEnabled && logDebug('useQuery.useEffect skip fetch', {skipFetch, queryKey, cacheKey})
      return
    }
    const expired = queryState.expiresAt != null && queryState.expiresAt <= Date.now()
    if (!fetchPolicy(expired, params, queryState, externalStore)) {
      logsEnabled &&
        logDebug('useQuery.useEffect skip fetch due to fetch policy', {
          queryState,
          expired,
          queryKey,
          cacheKey,
        })
      return
    }
    performFetch()
  }, [cacheKey, skipFetch])
  logsEnabled && logDebug('useQuery', {cacheKey, options: useQueryOptions, queryState})
  return [queryState, performFetch]
}

const defaultStateComparer = createStateComparer(['result', 'loading', 'params', 'error'])
