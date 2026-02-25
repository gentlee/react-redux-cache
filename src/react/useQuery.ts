import {useCallback, useEffect} from 'react'

import {CachePrivate} from '../private-types'
import {query as queryImpl} from '../query'
import {QueryOptions, QueryState, QueryStateComparer, Typenames, UseQueryOptions} from '../types'
import {
  createStateComparer,
  defaultGetCacheKey,
  EMPTY_OBJECT,
  logDebug,
  validateStoreHooks,
} from '../utilsAndConstants'

export const useQuery = <N extends string, T extends Typenames, QP, QR, MP, MR, QK extends keyof (QP & QR)>(
  cache: Pick<CachePrivate<N, T, QP, QR, MP, MR>, 'storeHooks' | 'config' | 'actions' | 'selectors'>,
  useQueryOptions: UseQueryOptions<T, QK, QP, QR>,
) => {
  type P = QK extends keyof (QP | QR) ? QP[QK] : never
  type R = QK extends keyof (QP | QR) ? QR[QK] : never

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
    fetchPolicy = queries[queryKey].fetchPolicy ?? globals.queries.fetchPolicy,
  } = useQueryOptions

  const queryInfo = queries[queryKey]

  const logsEnabled = configOptions.logsEnabled
  const getCacheKey = queryInfo.getCacheKey ?? defaultGetCacheKey<P>
  const comparer =
    selectorComparer === undefined
      ? ((queryInfo.selectorComparer as QueryStateComparer<T, P, R>) ??
        (globals.queries.selectorComparer as QueryStateComparer<T, P, R>) ??
        defaultStateComparer)
      : typeof selectorComparer === 'function'
        ? selectorComparer
        : createStateComparer(selectorComparer)

  const innerStore = storeHooks!.useStore()
  const externalStore = storeHooks!.useExternalStore()

  // @ts-expect-error fix types later
  const cacheKey = getCacheKey(params)

  /** Fetch query with the new parameters, or refetch with the same if parameters not provided. */
  const performFetch = useCallback(
    async (options?: Partial<Pick<QueryOptions<T, QP, QR, QK>, 'params' | 'onlyIfExpired'>>) => {
      const paramsPassed = options && 'params' in options
      const {secondsToLive, mergeResults, onCompleted, onSuccess, onError} = useQueryOptions
      return await queryImpl(
        'useQuery.fetch',
        innerStore,
        externalStore,
        cache,
        queryKey,
        // @ts-expect-error fix later
        paramsPassed ? getCacheKey(options.params) : cacheKey,
        paramsPassed ? options.params! : params, // params type can also have null | undefined, thats why we don't check for it here
        options?.onlyIfExpired,
        false,
        secondsToLive,
        // @ts-expect-error fix later
        mergeResults,
        onCompleted,
        onSuccess,
        onError,
      )
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [innerStore, externalStore, queryKey, cacheKey],
  )

  /** Query state */
  const queryState =
    storeHooks!.useSelector((state: unknown) => {
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
        externalStore,
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

  logsEnabled && logDebug('useQuery', {cacheKey, options: useQueryOptions, queryState})

  return [queryState as Omit<QueryState<T, P, R>, 'expiresAt'>, performFetch] as const
}

const defaultStateComparer = createStateComparer(['result', 'loading', 'params', 'error'])
