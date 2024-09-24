import {useCallback, useEffect} from 'react'
import {useSelector, useStore} from 'react-redux'

import {ActionMap} from './createActions'
import {query as queryImpl} from './query'
import {Cache, QueryOptions, QueryState, Typenames, UseQueryOptions} from './types'
import {DEFAULT_QUERY_MUTATION_STATE, defaultGetCacheKey, log} from './utilsAndConstants'

export const useQuery = <
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP, // TODO remove?
  MR,
  QK extends keyof (QP & QR)
>(
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
    cachePolicy = cache.queries[queryKey].cachePolicy ?? 'cache-first',
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
      return await queryImpl(
        'useQuery.fetch',
        store,
        cache,
        actions,
        queryKey,
        // @ts-expect-error fix later
        options ? getCacheKey(options.params) : cacheKey,
        options && 'params' in options ? options.params! : params, // params type can also have null | undefined, thats why we don't check for it here
        options?.onlyIfExpired
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
    }) ?? (DEFAULT_QUERY_MUTATION_STATE as QueryState<P, R>)

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
        log('useQuery.useEffect don`t fetch due to cache policy', {
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

  return [queryState, fetch] as const
}
