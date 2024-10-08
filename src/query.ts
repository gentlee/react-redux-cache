import {Store} from 'redux'

import type {ActionMap} from './createActions'
import type {Cache, Key, QueryResult, Typenames} from './types'
import {log} from './utilsAndConstants'

export const query = async <
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  QK extends keyof (QP & QR)
>(
  logTag: string,
  store: Store,
  cache: Cache<N, T, QP, QR, MP, MR>,
  {
    updateQueryStateAndEntities,
  }: Pick<ActionMap<N, T, QP, QR, unknown, unknown>, 'updateQueryStateAndEntities'>,
  queryKey: QK,
  cacheKey: Key,
  params: QK extends keyof (QP | QR) ? QP[QK] : never,
  secondsToLive: number | undefined = cache.queries[queryKey].secondsToLive ?? cache.globals.secondsToLive,
  onlyIfExpired: boolean | undefined,
  mergeResults = cache.queries[queryKey].mergeResults,
  onCompleted = cache.queries[queryKey].onCompleted,
  onSuccess = cache.queries[queryKey].onSuccess,
  onError = cache.queries[queryKey].onError
): Promise<QueryResult<QK extends keyof (QP | QR) ? QR[QK] : never>> => {
  const logsEnabled = cache.options.logsEnabled
  const cacheStateSelector = cache.cacheStateSelector

  const queryStateOnStart = cacheStateSelector(store.getState()).queries[queryKey as keyof (QP | QR)][
    cacheKey
  ]

  if (queryStateOnStart?.loading) {
    logsEnabled &&
      log(`${logTag} cancelled: already loading`, {
        queryStateOnStart,
        params,
        cacheKey,
      })

    return CANCELLED_RESULT
  }

  if (onlyIfExpired && queryStateOnStart?.expiresAt != null && queryStateOnStart.expiresAt > Date.now()) {
    logsEnabled &&
      log(`${logTag} cancelled: not expired yet`, {
        queryStateOnStart,
        params,
        cacheKey,
        onlyIfExpired,
      })
    return CANCELLED_RESULT
  }

  store.dispatch(
    updateQueryStateAndEntities(queryKey as keyof (QP | QR), cacheKey, {
      loading: true,
      params,
    })
  )

  logsEnabled && log(`${logTag} started`, {queryKey, params, cacheKey, queryStateOnStart, onlyIfExpired})

  let response
  const fetchFn = cache.queries[queryKey].query
  try {
    response = await fetchFn(
      // @ts-expect-error fix later
      params,
      store
    )
  } catch (error) {
    store.dispatch(
      updateQueryStateAndEntities(queryKey as keyof (QP | QR), cacheKey, {
        error: error as Error,
        loading: false,
      })
    )
    // @ts-expect-error params
    if (!onError?.(error, params, store)) {
      // @ts-expect-error queryKey
      cache.globals.onError?.(error, queryKey, params, store)
    }
    // @ts-expect-error params
    onCompleted?.(undefined, error, params, store)
    return {error}
  }

  const newState = {
    error: undefined,
    loading: false,
    expiresAt: response.expiresAt ?? (secondsToLive != null ? Date.now() + secondsToLive * 1000 : undefined),
    result: mergeResults
      ? mergeResults(
          // @ts-expect-error fix later
          cacheStateSelector(store.getState()).queries[queryKey as keyof (QP | QR)][cacheKey]?.result,
          response,
          params,
          store
        )
      : response.result,
  }

  store.dispatch(updateQueryStateAndEntities(queryKey as keyof (QP | QR), cacheKey, newState, response))
  // @ts-expect-error response
  onSuccess?.(response, params, store)
  // @ts-expect-error response
  onCompleted?.(response, undefined, params, store)

  return {
    // @ts-expect-error fix types
    result: newState?.result,
  }
}

const CANCELLED_RESULT = Object.freeze({cancelled: true})
