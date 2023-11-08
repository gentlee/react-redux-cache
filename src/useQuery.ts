import {useCallback, useEffect, useMemo, useRef} from 'react'
import {useSelector, useStore} from 'react-redux'

import {ReduxCacheState, setQueryStateAndEntities} from './reducer'
import {
  Cache,
  Key,
  QueryCacheOptions,
  QueryCachePolicy,
  QueryInfo,
  QueryMutationState,
  Typenames,
  UseQueryOptions,
} from './types'
import {
  defaultGetParamsKey,
  defaultQueryMutationState,
  log,
  useAssertValueNotChanged,
  useForceUpdate,
} from './utilsAndConstants'

const cacheFirstOptions = {
  policy: 'cache-first',
  cacheQueryState: true,
  cacheEntities: true,
} as const satisfies QueryCacheOptions

export const queryCacheOptionsByPolicy: Record<QueryCachePolicy, QueryCacheOptions> = {
  'cache-first': cacheFirstOptions,
  'cache-and-fetch': {
    ...cacheFirstOptions,
    policy: 'cache-and-fetch',
  },
} as const

export const defaultQueryCacheOptions = cacheFirstOptions

type RefState<P, R> = {
  params: P
  paramsKey: Key
  latestHookParamsKey: Key
  cacheKey: Key
  resultSelector?: (state: unknown) => R | undefined
}

export const useQuery = <T extends Typenames, QP, QR, MP, MR, QK extends keyof (QP & QR)>(
  cache: Cache<T, QP, QR, MP, MR>,
  options: UseQueryOptions<T, QP, QR, MP, MR, QK>
) => {
  type P = QK extends keyof (QP | QR) ? QP[QK] : never
  type R = QK extends keyof (QP | QR) ? QR[QK] : never
  type S = ReduxCacheState<T, QP, QR, MP, MR>

  const getParamsKey = cache.queries[options.query].getParamsKey ?? defaultGetParamsKey<P>

  const {
    query: queryKey,
    skip,
    params: hookParams,
    cacheOptions: cacheOptionsOrPolicy = cache.queries[queryKey].cacheOptions ??
      defaultQueryCacheOptions,
    mergeResults = cache.queries[queryKey].mergeResults,
    getCacheKey = cache.queries[queryKey].getCacheKey ?? getParamsKey,
  } = options

  const hookParamsKey = getParamsKey(
    // @ts-expect-error fix later
    hookParams
  )

  const cacheOptions =
    typeof cacheOptionsOrPolicy === 'string'
      ? queryCacheOptionsByPolicy[cacheOptionsOrPolicy]
      : cacheOptionsOrPolicy

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
          ['cacheOptions.cacheEntities', cacheOptions.cacheEntities],
          ['cacheOptions.cacheQueryState', cacheOptions.cacheQueryState],
          ['options.query', options.query],
          ['queryKey', queryKey],
          ['resultSelector', cache.queries[queryKey].resultSelector],
        ] as [key: string, value: unknown][]
      )
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .forEach((args) => useAssertValueNotChanged(...args))
    })()

  const forceUpdate = useForceUpdate()

  // Keeps most of local state.
  // Reference because state is changed not only by changing hook arguments, but also by calling fetch, and it should be done synchronously.
  const stateRef = useRef({} as RefState<P, R>)

  useMemo(() => {
    if (skip || stateRef.current.paramsKey === hookParamsKey) {
      return
    }

    const resultSelectorImpl = cache.queries[queryKey].resultSelector

    const state = stateRef.current
    state.params = hookParams
    state.paramsKey = hookParamsKey
    state.latestHookParamsKey = state.paramsKey
    // @ts-expect-error fix later
    state.cacheKey = getCacheKey(hookParams)
    state.resultSelector = createResultSelector<T, P, R, S>(
      // @ts-expect-error fix later
      resultSelectorImpl,
      cache.cacheStateSelector,
      hookParams
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hookParamsKey, skip])

  const resultFromSelector =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    stateRef.current.resultSelector && useSelector(stateRef.current.resultSelector)
  const hasResultFromSelector = resultFromSelector !== undefined

  const queryStateSelector = useCallback(
    (state: unknown) => {
      cache.options.logsEnabled &&
        log('queryStateSelector', {
          state,
          queryKey,
          cacheKey: stateRef.current.cacheKey,
          cacheState: cache.cacheStateSelector(state),
        })
      const queryState =
        cache.cacheStateSelector(state).queries[queryKey as keyof QR][stateRef.current.cacheKey]
      return queryState as QueryMutationState<R> | undefined // TODO proper type
    },
    // cacheKey needed only to re-evaluate queryStateSelector later
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateRef.current.cacheKey]
  )

  const queryStateFromSelector =
    useSelector(queryStateSelector) ?? (defaultQueryMutationState as QueryMutationState<R>)
  const queryState = hasResultFromSelector
    ? ({
        ...queryStateFromSelector,
        result: resultFromSelector,
      } satisfies QueryMutationState<R>)
    : queryStateFromSelector

  const fetchImpl = useCallback(async () => {
    cache.options.logsEnabled && log('useQuery.fetchImpl', {queryState})

    if (queryState.loading) {
      return
    }

    cacheOptions.cacheQueryState &&
      store.dispatch(
        setQueryStateAndEntities<T, QR, keyof QR>(queryKey as keyof QR, stateRef.current.cacheKey, {
          loading: true,
        })
      )

    const {paramsKey, params} = stateRef.current

    let response
    const fetchFn = cache.queries[queryKey].query
    try {
      response = await fetchFn(
        // @ts-expect-error fix later
        params
      )
    } catch (error) {
      if (stateRef.current.paramsKey === paramsKey && cacheOptions.cacheQueryState) {
        store.dispatch(
          setQueryStateAndEntities<T, QR, keyof QR>(
            queryKey as keyof QR,
            stateRef.current.cacheKey,
            {
              error: error as Error,
              loading: false,
            }
          )
        )
      }
    }

    if (response && stateRef.current.paramsKey === paramsKey) {
      store.dispatch(
        setQueryStateAndEntities(
          queryKey as keyof QR,
          stateRef.current.cacheKey,
          !cacheOptions.cacheQueryState
            ? undefined
            : {
                error: undefined,
                loading: false,
                result: hasResultFromSelector
                  ? undefined
                  : mergeResults
                  ? mergeResults(
                      // @ts-expect-error fix later
                      queryStateSelector(store.getState())?.result,
                      response,
                      params
                    )
                  : response.result,
              },
          cacheOptions.cacheEntities ? response : undefined
        )
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergeResults, queryState.loading, hasResultFromSelector])

  useEffect(() => {
    if (queryState.result != null && cacheOptions.policy === 'cache-first') {
      return
    }

    fetchImpl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateRef.current.latestHookParamsKey])

  const fetch = useCallback(
    (params?: P) => {
      cache.options.logsEnabled && log('useQuery.fetch', params)

      if (params !== undefined) {
        const state = stateRef.current
        // @ts-expect-error fix later
        const paramsKey = getParamsKey(params)

        if (state.paramsKey !== paramsKey) {
          const resultSelectorImpl = cache.queries[queryKey].resultSelector

          state.params = params
          state.paramsKey = paramsKey
          // @ts-expect-error fix later
          state.cacheKey = getCacheKey(params)
          state.resultSelector = createResultSelector<T, P, R, S>(
            // @ts-expect-error fix later
            resultSelectorImpl,
            cache.cacheStateSelector,
            hookParams
          )

          forceUpdate()
        }
      }

      return fetchImpl()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchImpl, getCacheKey]
  )

  cache.options.logsEnabled &&
    console.debug('[useQuery]', {
      state: stateRef.current,
      options,
      resultFromSelector,
      queryState,
    })

  return [queryState, fetch] as const
}

const createResultSelector = <T extends Typenames, P, R, S>(
  resultSelector: QueryInfo<T, P, R, S>['resultSelector'],
  cacheStateSelector: (state: unknown) => S,
  params: P
): RefState<P, R>['resultSelector'] => {
  return (
    resultSelector && ((state: unknown) => resultSelector(cacheStateSelector(state) as S, params))
  )
}
