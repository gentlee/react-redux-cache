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

import {query as queryImpl} from './query'
import {createStateComparer, defaultGetCacheKey, EMPTY_OBJECT, log} from './utilsAndConstants'

export const useQuery = (cache, actions, selectors, options) => {
  var _a, _b, _c, _d, _e
  const {
    query: queryKey,
    skipFetch = false,
    params,
    secondsToLive,
    selectorComparer,
    fetchPolicy = (_a = cache.queries[queryKey].fetchPolicy) !== null && _a !== void 0
      ? _a
      : cache.globals.queries.fetchPolicy,
    mergeResults,
    onCompleted,
    onSuccess,
    onError,
  } = options
  const {selectQueryState} = selectors
  const queryInfo = cache.queries[queryKey]
  const logsEnabled = cache.options.logsEnabled
  const getCacheKey = (_b = queryInfo.getCacheKey) !== null && _b !== void 0 ? _b : defaultGetCacheKey
  const comparer =
    selectorComparer === undefined
      ? (_d =
          (_c = queryInfo.selectorComparer) !== null && _c !== void 0
            ? _c
            : cache.globals.queries.selectorComparer) !== null && _d !== void 0
        ? _d
        : defaultStateComparer
      : typeof selectorComparer === 'function'
      ? selectorComparer
      : createStateComparer(selectorComparer)
  const store = cache.storeHooks.useStore()
  const cacheKey = getCacheKey(params)
  const performFetch = useCallback(
    (options) =>
      __awaiter(void 0, void 0, void 0, function* () {
        const paramsPassed = options && 'params' in options
        return yield queryImpl(
          'useQuery.fetch',
          store,
          cache,
          actions,
          selectors,
          queryKey,
          paramsPassed ? getCacheKey(options.params) : cacheKey,
          paramsPassed ? options.params : params,
          secondsToLive,
          options === null || options === void 0 ? void 0 : options.onlyIfExpired,
          false,
          mergeResults,
          onCompleted,
          onSuccess,
          onError
        )
      }),
    [store, queryKey, cacheKey]
  )
  const queryState =
    (_e = cache.storeHooks.useSelector((state) => {
      return selectQueryState(state, queryKey, cacheKey)
    }, comparer)) !== null && _e !== void 0
      ? _e
      : EMPTY_OBJECT
  useEffect(() => {
    if (skipFetch) {
      logsEnabled && log('useQuery.useEffect skip fetch', {skipFetch, queryKey, cacheKey})
      return
    }
    const expired = queryState.expiresAt != null && queryState.expiresAt <= Date.now()
    if (!fetchPolicy(expired, params, queryState, store, selectors)) {
      logsEnabled &&
        log('useQuery.useEffect skip fetch due to fetch policy', {
          queryState,
          expired,
          queryKey,
          cacheKey,
        })
      return
    }
    performFetch()
  }, [cacheKey, skipFetch])
  logsEnabled &&
    log('useQuery', {
      cacheKey,
      options,
      queryState,
    })
  return [queryState, performFetch]
}
const defaultStateComparer = createStateComparer(['result', 'loading', 'params', 'error'])
