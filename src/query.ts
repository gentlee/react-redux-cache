import type {Actions} from './createActions'
import {Selectors} from './createSelectors'
import type {Cache, Key, QueryResult, Store, Typenames} from './types'
import {log, NOOP} from './utilsAndConstants'

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
  actions: Actions<N, T, QP, QR, MP, MR>,
  selectors: Selectors<N, T, QP, QR, MP, MR>,
  queryKey: QK,
  cacheKey: Key,
  params: QK extends keyof (QP | QR) ? QP[QK] : never,
  secondsToLive: number | undefined = cache.queries[queryKey].secondsToLive ??
    cache.globals.queries.secondsToLive,
  onlyIfExpired: boolean | undefined,
  mergeResults = cache.queries[queryKey].mergeResults,
  onCompleted = cache.queries[queryKey].onCompleted,
  onSuccess = cache.queries[queryKey].onSuccess,
  onError = cache.queries[queryKey].onError
): Promise<QueryResult<QK extends keyof (QP | QR) ? QR[QK] : never>> => {
  const {selectQueryResult, selectQueryState} = selectors

  const logsEnabled = cache.options.logsEnabled

  const queryStateOnStart = selectQueryState(store.getState(), queryKey, cacheKey)

  if (queryStateOnStart?.loading) {
    logsEnabled &&
      log(`${logTag} fetch cancelled: already loading`, {
        queryStateOnStart,
        params,
        cacheKey,
      })

    const error = await queryStateOnStart.loading.then(NOOP).catch(catchAndReturn)
    return error
      ? {
          cancelled: 'loading',
          error,
        }
      : {
          cancelled: 'loading',
          result: selectQueryResult(store.getState(), queryKey, cacheKey),
        }
  }

  if (onlyIfExpired && queryStateOnStart?.expiresAt != null && queryStateOnStart.expiresAt > Date.now()) {
    logsEnabled &&
      log(`${logTag} fetch cancelled: not expired yet`, {
        queryStateOnStart,
        params,
        cacheKey,
        onlyIfExpired,
      })

    return {
      cancelled: 'not-expired',
      result: queryStateOnStart.result,
    }
  }

  const {updateQueryStateAndEntities} = actions

  const fetchPromise = cache.queries[queryKey].query(
    // @ts-expect-error fix later
    params,
    store
  )

  store.dispatch(
    updateQueryStateAndEntities(queryKey as keyof (QP | QR), cacheKey, {
      loading: fetchPromise,
      params,
    })
  )

  logsEnabled && log(`${logTag} started`, {queryKey, params, cacheKey, queryStateOnStart, onlyIfExpired})

  let response
  try {
    response = await fetchPromise
  } catch (error) {
    store.dispatch(
      updateQueryStateAndEntities(queryKey as keyof (QP | QR), cacheKey, {
        error: error as Error,
        loading: undefined,
      })
    )
    // @ts-expect-error params
    if (!onError?.(error, params, store)) {
      cache.globals.onError?.(
        error,
        // @ts-expect-error queryKey
        queryKey,
        params,
        store,
        actions,
        selectors
      )
    }
    onCompleted?.(
      undefined,
      error,
      // @ts-expect-error params
      params,
      store,
      actions,
      selectors
    )
    return {error}
  }

  const newState = {
    error: undefined,
    loading: undefined,
    expiresAt: response.expiresAt ?? (secondsToLive != null ? Date.now() + secondsToLive * 1000 : undefined),
    result: mergeResults
      ? mergeResults(
          // @ts-expect-error fix later
          selectQueryResult(store.getState(), queryKey, cacheKey),
          response,
          params,
          store,
          actions,
          selectors
        )
      : response.result,
  }

  store.dispatch(updateQueryStateAndEntities(queryKey as keyof (QP | QR), cacheKey, newState, response))
  onSuccess?.(
    // @ts-expect-error response
    response,
    params,
    store,
    actions,
    selectors
  )
  onCompleted?.(
    // @ts-expect-error response
    response,
    undefined,
    params,
    store,
    actions,
    selectors
  )

  return {
    // @ts-expect-error fix types
    result: newState?.result,
  }
}

const catchAndReturn = (x: unknown) => x
