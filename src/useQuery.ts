import {useCallback, useEffect, useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'

import {ActionMap} from './createActions'
import {query as queryImpl} from './query'
import {Cache, QueryMutationState, Typenames, UseQueryOptions} from './types'
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
  const cacheResultSelector = cache.queries[queryKey].resultSelector
  const cacheStateSelector = cache.cacheStateSelector

  const store = useStore()

  // @ts-expect-error fix types later
  const cacheKey = getCacheKey(params)

  const resultSelector = useMemo(() => {
    return (
      cacheResultSelector &&
      ((state: unknown) =>
        cacheResultSelector(
          cacheStateSelector(state),
          // @ts-expect-error fix types later
          params
        ))
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const resultFromSelector = (resultSelector && useSelector(resultSelector)) as R | undefined
  const hasResultFromSelector = resultFromSelector !== undefined

  const fetch = useCallback(async () => {
    return await queryImpl('useQuery.fetch', store, cache, actions, queryKey, cacheKey, params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [store, queryKey, cacheKey])

  const queryStateFromSelector =
    useSelector((state: unknown) => {
      const queryState = cacheStateSelector(state).queries[queryKey as keyof (QP | QR)][cacheKey]
      return queryState as QueryMutationState<P, R> | undefined // TODO proper type
    }) ?? (DEFAULT_QUERY_MUTATION_STATE as QueryMutationState<P, R>)

  const queryState = hasResultFromSelector
    ? ({
        ...queryStateFromSelector,
        result: resultFromSelector,
      } satisfies QueryMutationState<P, R>)
    : queryStateFromSelector

  useEffect(() => {
    if (skip) {
      logsEnabled && log('useQuery.useEffect skip fetch', {skip, cacheKey})
      return
    }
    if (queryState.result != null && cachePolicy === 'cache-first') {
      logsEnabled &&
        log('useQuery.useEffect don`t fetch due to cache policy', {
          result: queryState.result,
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
      resultFromSelector,
      queryState,
    })

  return [
    /** Query state */
    queryState,
    /** Refetch query with the same parameters */
    fetch,
  ] as const
}
