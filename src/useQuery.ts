import {useCallback, useEffect} from 'react'
import {useSelector, useStore} from 'react-redux'

import {ActionMap} from './createActions'
import {query as queryImpl} from './query'
import {Cache, QueryOptions, QueryState, Typenames, UseQueryOptions} from './types'
import {DEFAULT_QUERY_MUTATION_STATE, defaultGetCacheKey, log} from './utilsAndConstants'

export const useQuery = <N extends string, T extends Typenames, QP, QR, MP, MR, QK extends keyof (QP & QR)>(
  cache: Cache<N, T, QP, QR, MP, MR>,
  actions: Pick<ActionMap<N, T, QP, QR, MP, MR>, 'updateQueryStateAndEntities'>,
  options: UseQueryOptions<T, QP, QR, QK>
) => {
  type P = QK extends keyof (QP | QR) ? QP[QK] : never
  type R = QK extends keyof (QP | QR) ? QR[QK] : never

  const {
    query: queryKey,
    skip,
    params,
    secondsToLive,
    cachePolicy = cache.queries[queryKey].cachePolicy ?? cache.defaults.cachePolicy,
    mergeResults,
    onCompleted,
    onSuccess,
    onError,
  } = options

  const logsEnabled = cache.options.logsEnabled
  const getCacheKey = cache.queries[queryKey].getCacheKey ?? defaultGetCacheKey<P>
  const cacheStateSelector = cache.cacheStateSelector

  const store = useStore()

  // @ts-expect-error fix types later
  const cacheKey = getCacheKey(params)

  /** Fetch query with the new parameters, or refetch with the same if parameters not provided. */
  const fetch = useCallback(
    async (options?: Partial<Pick<QueryOptions<T, QP, QR, QK>, 'params' | 'onlyIfExpired'>>) => {
      const paramsPassed = options && 'params' in options
      return await queryImpl(
        'useQuery.fetch',
        store,
        cache,
        actions,
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

  /** Query state */
  const queryState =
    useSelector((state: unknown) => {
      const queryState = cacheStateSelector(state).queries[queryKey as keyof (QP | QR)][cacheKey]
      return queryState as QueryState<P, R> | undefined // TODO proper type
    }, useQueryStateComparer<P, R>) ?? (DEFAULT_QUERY_MUTATION_STATE as QueryState<P, R>)

  useEffect(() => {
    if (skip) {
      logsEnabled && log('useQuery.useEffect skip fetch', {skip, cacheKey})
      return
    }

    if (
      queryState.result != null &&
      cachePolicy === 'cache-first' &&
      (queryState.expiresAt == null || queryState.expiresAt > Date.now())
    ) {
      logsEnabled &&
        log('useQuery.useEffect no fetch due to cache policy', {
          result: queryState.result,
          expiresAt: queryState.expiresAt,
          now: Date.now(),
          cachePolicy,
        })
      return
    }

    fetch()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, cachePolicy, skip])

  logsEnabled &&
    log('useQuery', {
      cacheKey,
      options,
      queryState,
    })

  return [queryState as Omit<QueryState<P, R>, 'expiresAt'>, fetch] as const
}

/** Omit `expiresAt` from comparison */
const useQueryStateComparer = <P, R>(
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
    state1.error === state2.error &&
    state1.loading === state2.loading &&
    state1.params === state2.params &&
    state1.result === state2.result
  )
}
