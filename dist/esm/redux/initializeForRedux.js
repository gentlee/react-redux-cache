import {bindAsyncActions} from '../bindAsyncActions'
import {mutate as mutateImpl} from '../mutate'
import {query as queryImpl} from '../query'
import {defaultGetCacheKey} from '../utilsAndConstants'

export const initializeForRedux = (cache) => {
  const privateCache = cache
  const {
    config: {queries},
    actions: {
      clearCache,
      clearMutationState,
      clearQueryState,
      invalidateQuery,
      mergeEntityChanges,
      updateMutationStateAndEntities,
      updateQueryStateAndEntities,
    },
  } = privateCache
  const result = {
    reducer: privateCache.reducer,
    actions: {
      updateQueryStateAndEntities,
      updateMutationStateAndEntities,
      mergeEntityChanges,
      invalidateQuery,
      clearQueryState,
      clearMutationState,
      clearCache,
    },
    asyncActions: {
      query: (store, options) => {
        var _a
        const {query: queryKey, params} = options
        const getCacheKey =
          (_a = queries[queryKey].getCacheKey) !== null && _a !== void 0 ? _a : defaultGetCacheKey
        const cacheKey = getCacheKey(params)
        return queryImpl(
          'query',
          store,
          store,
          privateCache,
          queryKey,
          cacheKey,
          params,
          options.onlyIfExpired,
          options.skipFetch,
          options.secondsToLive,
          options.mergeResults,
          options.onCompleted,
          options.onSuccess,
          options.onError,
        )
      },
      mutate: (store, options) => {
        return mutateImpl(
          'mutate',
          store,
          store,
          privateCache,
          options.mutation,
          options.params,
          options.onCompleted,
          options.onSuccess,
          options.onError,
        )
      },
    },
    utils: {
      bindAsyncActions: (store) => bindAsyncActions(privateCache, store, store),
    },
  }
  return result
}
