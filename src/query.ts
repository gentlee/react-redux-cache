import {Store} from 'redux'

import {setQueryStateAndEntities} from './reducer'
import {Cache, Key, QueryCacheOptions, QueryResult, Typenames} from './types'
import {log} from './utilsAndConstants'

export const query = async <T extends Typenames, QP, QR, MP, MR, QK extends keyof (QP & QR)>(
  logTag: string,
  returnResult: boolean,
  store: Store,
  cache: Cache<T, QP, QR, MP, MR>,
  queryKey: QK,
  cacheKey: Key,
  cacheOptions: QueryCacheOptions,
  params: QK extends keyof (QP | QR) ? QP[QK] : never
): Promise<void | QueryResult<QK extends keyof (QP | QR) ? QR[QK] : never>> => {
  const logsEnabled = cache.options.logsEnabled
  const cacheStateSelector = cache.cacheStateSelector
  const cacheResultSelector = cache.queries[queryKey].resultSelector
  const mergeResults = cache.queries[queryKey].mergeResults

  const queryStateOnStart = cacheStateSelector(store.getState()).queries[queryKey as keyof QR][
    cacheKey
  ]

  if (queryStateOnStart?.loading) {
    logsEnabled &&
      log(`${logTag} cancelled: already loading`, {
        queryStateOnStart,
        params,
        cacheKey,
      })

    return returnResult ? {cancelled: true} : undefined
  }

  cacheOptions.cacheQueryState &&
    store.dispatch(
      setQueryStateAndEntities<T, QR, keyof QR>(queryKey as keyof QR, cacheKey, {
        loading: true,
      })
    )

  logsEnabled && log(`${logTag} started`, {queryStateOnStart, params, cacheKey})

  let response
  const fetchFn = cache.queries[queryKey].query
  try {
    response = await fetchFn(
      // @ts-expect-error fix later
      params
    )
  } catch (error) {
    store.dispatch(
      setQueryStateAndEntities<T, QR, keyof QR>(queryKey as keyof QR, cacheKey, {
        error: error as Error,
        loading: false,
      })
    )
    return returnResult ? {error} : undefined
  }

  const newState = cacheOptions.cacheQueryState
    ? {
        error: undefined,
        loading: false,
        result: cacheResultSelector
          ? undefined
          : mergeResults
          ? mergeResults(
              // @ts-expect-error fix later
              cacheStateSelector(store.getState()).queries[queryKey as keyof QR][cacheKey]?.result,
              response,
              params
            )
          : response.result,
      }
    : undefined

  store.dispatch(
    setQueryStateAndEntities(
      queryKey as keyof QR,
      cacheKey,
      newState,
      cacheOptions.cacheEntities ? response : undefined
    )
  )

  // @ts-expect-error fix types
  return returnResult
    ? {
        result: cacheResultSelector
          ? cacheResultSelector(
              cacheStateSelector(store.getState()),
              // @ts-expect-error fix types
              params
            )
          : newState?.result,
      }
    : undefined
}
