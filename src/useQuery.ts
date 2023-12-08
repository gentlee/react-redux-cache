import {useCallback, useEffect, useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'

import {query as queryImpl} from './query'
import {Cache, QueryMutationState, Typenames, UseQueryOptions} from './types'
import {
  defaultGetParamsKey,
  defaultQueryMutationState,
  log,
  useAssertValueNotChanged,
} from './utilsAndConstants'

export const useQuery = <T extends Typenames, QP, QR, MP, MR, QK extends keyof (QP & QR)>(
  cache: Cache<T, QP, QR, MP, MR>,
  options: UseQueryOptions<T, QP, QR, MP, MR, QK>
) => {
  type P = QK extends keyof (QP | QR) ? QP[QK] : never
  type R = QK extends keyof (QP | QR) ? QR[QK] : never

  const {
    query: queryKey,
    skip,
    params,
    cachePolicy = cache.queries[queryKey].cachePolicy ?? 'cache-first',
    getCacheKey = cache.queries[queryKey].getCacheKey,
  } = options

  const logsEnabled = cache.options.logsEnabled
  const getParamsKey = cache.queries[queryKey].getParamsKey ?? defaultGetParamsKey<P>
  const cacheResultSelector = cache.queries[queryKey].resultSelector
  const cacheStateSelector = cache.cacheStateSelector

  const store = useStore()

  // Check values that should be set once.
  cache.options.validateHookArguments &&
    (() => {
      ;(
        [
          ['store', store],
          ['cache', cache],
          ['cache.queries', cache.queries],
          ['cacheStateSelector', cache.cacheStateSelector],
          ['options.query', options.query],
          ['queryKey', queryKey],
          ['resultSelector', cache.queries[queryKey].resultSelector],
          ['mergeResults', cache.queries[queryKey].mergeResults],
          ['getParamsKey', cache.queries[queryKey].getParamsKey],
          ['getCacheKey', cache.queries[queryKey].getCacheKey],
        ] as [key: string, value: unknown][]
      )
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .forEach((args) => useAssertValueNotChanged(...args))
    })()

  const paramsKey = getParamsKey(
    // @ts-expect-error fix later
    params
  )

  const [cacheKey, resultSelector] = useMemo(() => {
    return [
      // cacheKey
      getCacheKey
        ? // @ts-expect-error fix types later
          getCacheKey(params)
        : paramsKey,
      // resultSelector
      cacheResultSelector &&
        ((state: unknown) =>
          cacheResultSelector(
            cacheStateSelector(state),
            // @ts-expect-error fix types later
            params
          )),
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paramsKey])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const resultFromSelector = (resultSelector && useSelector(resultSelector)) as R | undefined
  const hasResultFromSelector = resultFromSelector !== undefined

  const fetch = useCallback(async () => {
    await queryImpl('useQuery.fetch', false, store, cache, queryKey, cacheKey, params)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, paramsKey])

  const queryStateFromSelector =
    useSelector((state: unknown) => {
      const queryState = cacheStateSelector(state).queries[queryKey as keyof QR][cacheKey]
      return queryState as QueryMutationState<R> | undefined // TODO proper type
    }) ?? (defaultQueryMutationState as QueryMutationState<R>)

  const queryState = hasResultFromSelector
    ? ({
        ...queryStateFromSelector,
        result: resultFromSelector,
      } satisfies QueryMutationState<R>)
    : queryStateFromSelector

  useEffect(() => {
    if (skip) {
      logsEnabled && log('useQuery.useEffect skip fetch', {skip, paramsKey})
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
  }, [paramsKey, cachePolicy, skip])

  logsEnabled &&
    log('useQuery', {
      paramsKey,
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
