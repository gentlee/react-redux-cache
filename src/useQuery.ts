import {useCallback, useEffect} from 'react'

import {Actions} from './createActions'
import {Selectors} from './createSelectors'
import {query as queryImpl} from './query'
import {Cache, QueryOptions, QueryState, QueryStateComparer, Typenames, UseQueryOptions} from './types'
import {createStateComparer, defaultGetCacheKey, EMPTY_OBJECT, logDebug} from './utilsAndConstants'

export const useQuery = <N extends string, T extends Typenames, QP, QR, MP, MR, QK extends keyof (QP & QR)>(
  cache: Pick<Cache<N, T, QP, QR, MP, MR>, 'options' | 'globals' | 'queries' | 'storeHooks'>,
  actions: Actions<N, T, QP, QR, MP, MR>,
  selectors: Selectors<N, T, QP, QR, MP, MR>,
  options: UseQueryOptions<N, T, QK, QP, QR, MP, MR>
) => {
  type P = QK extends keyof (QP | QR) ? QP[QK] : never
  type R = QK extends keyof (QP | QR) ? QR[QK] : never

  const {
    query: queryKey,
    skipFetch = false,
    params,
    secondsToLive,
    selectorComparer,
    fetchPolicy = cache.queries[queryKey].fetchPolicy ?? cache.globals.queries.fetchPolicy,
    mergeResults,
    onCompleted,
    onSuccess,
    onError,
  } = options

  const {selectQueryState} = selectors

  const queryInfo = cache.queries[queryKey]

  const logsEnabled = cache.options.logsEnabled
  const getCacheKey = queryInfo.getCacheKey ?? defaultGetCacheKey<P>
  const comparer =
    selectorComparer === undefined
      ? (queryInfo.selectorComparer as QueryStateComparer<T, P, R>) ??
        (cache.globals.queries.selectorComparer as QueryStateComparer<T, P, R>) ??
        defaultStateComparer
      : typeof selectorComparer === 'function'
      ? selectorComparer
      : createStateComparer(selectorComparer)

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
        false,
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
    cache.storeHooks.useSelector((state: unknown) => {
      return selectQueryState(state, queryKey, cacheKey) as QueryState<T, P, R> | undefined // TODO proper type
    }, comparer) ?? (EMPTY_OBJECT as QueryState<T, P, R>)

  useEffect(() => {
    if (skipFetch) {
      logsEnabled && logDebug('useQuery.useEffect skip fetch', {skipFetch, queryKey, cacheKey})
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
        logDebug('useQuery.useEffect skip fetch due to fetch policy', {
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
    logDebug('useQuery', {
      cacheKey,
      options,
      queryState,
    })

  return [queryState as Omit<QueryState<T, P, R>, 'expiresAt'>, performFetch] as const
}

const defaultStateComparer = createStateComparer(['result', 'loading', 'params', 'error'])
