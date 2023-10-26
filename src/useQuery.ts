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
  defaultEndpointState,
  defaultGetParamsKey,
  useAssertValueNotChanged,
  useForceUpdate,
} from './utilsAndConstants'

const CACHE_FIRST_OPTIONS = {
  policy: 'cache-first',
  cacheQueryState: true,
  cacheEntities: true,
} as const satisfies QueryCacheOptions

export const QUERY_CACHE_OPTIONS_BY_POLICY: Record<QueryCachePolicy, QueryCacheOptions> = {
  'cache-first': CACHE_FIRST_OPTIONS,
  'cache-and-fetch': {
    ...CACHE_FIRST_OPTIONS,
    policy: 'cache-and-fetch',
  },
} as const

export const DEFAULT_QUERY_CACHE_OPTIONS = CACHE_FIRST_OPTIONS

const getRequestKey = (queryKey: Key, paramsKey: Key) => `${String(queryKey)}:${String(paramsKey)}`

type RefState<P, R> = {
  params: P
  paramsKey: Key
  cacheKey: Key
  requestKey: string
  latestHookRequestKey: string
  resultSelector?: (state: any) => R | undefined
}

export const useQuery = <T extends Typenames, QP, QR, MP, MR, QK extends keyof (QP & QR)>(
  cache: Cache<T, QP, QR, MP, MR>,
  options: UseQueryOptions<T, QP, QR, MP, MR, QK>
) => {
  type P = QK extends keyof (QP | QR) ? QP[QK] : never
  type R = QK extends keyof (QP | QR) ? QR[QK] : never
  type S = ReduxCacheState<T, QP, QR, MP, MR>

  const {
    query: queryKey,
    skip,
    params: hookParams,
    cacheOptions: cacheOptionsOrPolicy = cache.queries[queryKey].cacheOptions ??
      DEFAULT_QUERY_CACHE_OPTIONS,
    mergeResults = cache.queries[queryKey].mergeResults,
    getParamsKey = cache.queries[queryKey].getParamsKey ?? defaultGetParamsKey<P>,
    getCacheKey = cache.queries[queryKey].getCacheKey ?? getParamsKey,
  } = options

  const cacheOptions =
    typeof cacheOptionsOrPolicy === 'string'
      ? QUERY_CACHE_OPTIONS_BY_POLICY[cacheOptionsOrPolicy]
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
        ] as [key: string, value: any][]
      )
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .forEach((args) => useAssertValueNotChanged(...args))
    })()

  const forceUpdate = useForceUpdate()

  const hookParamsKey = useMemo(
    () =>
      // @ts-expect-error fix later
      getParamsKey(hookParams),
    [getParamsKey, hookParams]
  )

  // Keeps most of local state.
  // Reference because state is changed not only by changing hook arguments, but also by calling fetch, and it should be done synchronously.
  const stateRef = useRef({} as RefState<P, R>)

  useMemo(() => {
    if (stateRef.current.paramsKey === hookParamsKey) {
      return
    }

    const resultSelectorImpl = cache.queries[queryKey].resultSelector

    const state = stateRef.current
    state.params = hookParams
    state.paramsKey = hookParamsKey
    // @ts-expect-error fix later
    state.cacheKey = getCacheKey(hookParams)
    state.requestKey = getRequestKey(queryKey, hookParamsKey)
    state.latestHookRequestKey = state.requestKey
    state.resultSelector = createResultSelector<T, P, R, S>(
      // @ts-expect-error fix later
      resultSelectorImpl,
      cache.cacheStateSelector,
      hookParams
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hookParamsKey])

  const resultFromSelector =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    stateRef.current.resultSelector && useSelector(stateRef.current.resultSelector)
  const hasResultFromSelector = resultFromSelector !== undefined

  const queryStateSelector = useCallback((state: any) => {
    cache.options.logsEnabled &&
      console.log('[queryStateSelector]', {
        state: state,
        queryKey,
        cacheKey: stateRef.current.cacheKey,
        cacheState: cache.cacheStateSelector(state),
      })
    const queryState =
      cache.cacheStateSelector(state).queries[queryKey as keyof QR][stateRef.current.cacheKey]
    return queryState as QueryMutationState<R> | undefined // TODO proper type
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const queryStateFromSelector =
    useSelector(queryStateSelector) ?? (defaultEndpointState as QueryMutationState<R>)
  const queryState = hasResultFromSelector
    ? ({
        ...queryStateFromSelector,
        result: resultFromSelector,
      } satisfies QueryMutationState<R>)
    : queryStateFromSelector

  cache.options.logsEnabled &&
    console.log('[useQuery]', {
      queryKey,
      refState: stateRef.current,
      cacheOptions,
      resultFromSelector,
      hasResultFromSelector,
      queryState,
      queryStateFromSelector,
    })

  const fetchImpl = useCallback(async () => {
    cache.options.logsEnabled && console.log('[useQuery.fetch]', {queryState})

    if (queryState.loading) {
      return
    }

    cacheOptions.cacheQueryState &&
      store.dispatch(
        setQueryStateAndEntities<T, QR, keyof QR>(queryKey as keyof QR, stateRef.current.cacheKey, {
          loading: true,
        })
      )

    const {requestKey, params} = stateRef.current

    let response
    const fetchFn = cache.queries[queryKey].query
    try {
      response = await fetchFn(
        // @ts-expect-error fix later
        params
      )
    } catch (error) {
      if (stateRef.current.requestKey === requestKey && cacheOptions.cacheQueryState) {
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

    if (response && stateRef.current.requestKey === requestKey) {
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
    if (skip) {
      return
    }
    if (queryState.result != null && cacheOptions.policy === 'cache-first') {
      return
    }

    fetchImpl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateRef.current.latestHookRequestKey, skip])

  const fetch = useCallback(
    (params?: P) => {
      cache.options.logsEnabled && console.log('[fetch]', params)

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
          state.requestKey = getRequestKey(queryKey, state.paramsKey)
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
    [fetchImpl, getCacheKey, getParamsKey]
  )

  return [queryState, fetch] as const
}

const createResultSelector = <T extends Typenames, P, R, S>(
  resultSelector: QueryInfo<T, P, R, S>['resultSelector'],
  cacheStateSelector: (state: any) => S,
  params: P
): RefState<P, R>['resultSelector'] => {
  return resultSelector && ((state: any) => resultSelector(cacheStateSelector(state) as S, params))
}
