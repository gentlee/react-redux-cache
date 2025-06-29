import {useCallback, useEffect} from 'react'

import {Actions} from './createActions'
import {Selectors} from './createSelectors'
import {query as queryImpl} from './query'
import {Cache, QueryOptions, QueryState, Typenames, UseQueryOptions} from './types'
import {defaultGetCacheKey, EMPTY_OBJECT, log} from './utilsAndConstants'

export const useQuery = <N extends string, T extends Typenames, QP, QR, MP, MR, QK extends keyof (QP & QR)>(
  cache: Pick<Cache<N, T, QP, QR, MP, MR>, 'options' | 'globals' | 'queries' | 'storeHooks'>,
  actions: Actions<N, T, QP, QR, MP, MR>,
  selectors: Selectors<N, T, QP, QR, MP, MR>,
  options: UseQueryOptions<N, T, QK, QP, QR, MP, MR>
) => {
  type P = QK extends keyof (QP | QR) ? QP[QK] : never
  type R = QK extends keyof (QP | QR) ? QR[QK] : never

  const {selectQueryState} = selectors
  const {
    query: queryKey,
    skipFetch = false,
    params,
    secondsToLive,
    fetchPolicy = cache.queries[queryKey].fetchPolicy ?? cache.globals.queries.fetchPolicy,
    mergeResults,
    onCompleted,
    onSuccess,
    onError,
  } = options

  const logsEnabled = cache.options.logsEnabled
  const getCacheKey = cache.queries[queryKey].getCacheKey ?? defaultGetCacheKey<P>

  const store = cache.storeHooks.useStore()

  // @ts-expect-error fix types later
  const cacheKey = getCacheKey(params)

  /** Fetch query with the new parameters, or refetch with the same if parameters not provided. */
  const performFetch = useCallback(
    async (options?: Partial<Pick<QueryOptions<N, T, QP, QR, QK, MP, MR>, 'params' | 'onlyIfExpired'>>) => {
      const paramsPassed = options && 'params' in options
      return await queryImpl(
        'useQuery.fetch',
        store,
        cache,
        actions,
        selectors,
        queryKey,
        // @ts-expect-error fix later
        paramsPassed ? getCacheKey(options.params) : cacheKey,
        paramsPassed ? options.params! : params, // params type can also have null | undefined, thats why we don't check for it here
        secondsToLive,
        options?.onlyIfExpired,
        // @ts-expect-error fix later
        mergeResults,
        onCompleted,
        onSuccess,
        onError
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, queryKey, cacheKey]
  )

  /** Query state. */
  const queryState: QueryState<P, R> =
    cache.storeHooks.useSelector(
      (state: unknown) => selectQueryState(state, queryKey, cacheKey),
      useQuerySelectorStateComparer<P, R>
    ) ?? EMPTY_OBJECT

  useEffect(() => {
    if (skipFetch) {
      logsEnabled && log('useQuery.useEffect skip fetch', {skipFetch, queryKey, cacheKey})
      return
    }

    const expired = queryState.expiresAt != null && queryState.expiresAt <= Date.now()
    if (
      !fetchPolicy(
        expired,
        // @ts-expect-error params
        params,
        queryState,
        store,
        selectors
      )
    ) {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, skipFetch])

  logsEnabled &&
    log('useQuery', {
      cacheKey,
      options,
      queryState,
    })

  return [queryState as Omit<QueryState<P, R>, 'expiresAt'>, performFetch] as const
}

/** Omit `expiresAt` from comparison */
export const useQuerySelectorStateComparer = <P, R>(
  state1: QueryState<P, R> | undefined,
  state2: QueryState<P, R> | undefined
) => {
  if (state1 === state2) {
    return true
  }
  if (state1 === undefined || state2 === undefined) {
    return false
  }
  return (
    state1.params === state2.params &&
    state1.loading === state2.loading &&
    state1.result === state2.result &&
    state1.error === state2.error
  )
}
