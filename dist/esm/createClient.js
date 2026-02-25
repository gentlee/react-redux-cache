import {mutate as mutateImpl} from './mutate'
import {query as queryImpl} from './query'
import {defaultGetCacheKey} from './utilsAndConstants'

export const createClient = (cache, innerStore, externalStore) => {
  const {
    config: {queries},
  } = cache
  const client = {
    query: (options) => {
      var _a
      const {query: queryKey, params} = options
      const getCacheKey =
        (_a = queries[queryKey].getCacheKey) !== null && _a !== void 0 ? _a : defaultGetCacheKey
      const cacheKey = getCacheKey(params)
      return queryImpl(
        'query',
        innerStore,
        externalStore,
        cache,
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
    mutate: (options) => {
      return mutateImpl(
        'mutate',
        innerStore,
        externalStore,
        cache,
        options.mutation,
        options.params,
        options.onCompleted,
        options.onSuccess,
        options.onError,
      )
    },
  }
  return client
}
