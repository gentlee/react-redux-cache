import {useEffect, useMemo, useCallback, useRef} from 'react'
import {useSelector, useStore} from 'react-redux'
import {setStateAction} from 'redux-light'
import {
  Cache,
  ExtractQueryParams,
  ExtractQueryResult,
  Key,
  QueryCacheOptions,
  QueryCachePolicy,
  QueryInfo,
  QueryResponse,
  Typenames,
} from './types'
import {
  defaultEndpointState,
  defaultGetParamsKey,
  shallowMerge,
  useAssertValueNotChanged,
  useForceUpdate,
} from './utilsAndConstants'
import {Store} from 'redux'

const CACHE_FIRST_OPTIONS = {
  policy: 'cache-first',
  cacheQueryState: true,
  cacheEntities: true,
} as const satisfies QueryCacheOptions

export const QUERY_CACHE_OPTIONS_BY_POLICY: Record<QueryCachePolicy, QueryCacheOptions> = {
  'cache-first': CACHE_FIRST_OPTIONS,
  'cache-and-network': {
    ...CACHE_FIRST_OPTIONS,
    policy: 'cache-and-network',
  },
} as const

export const DEFAULT_QUERY_CACHE_OPTIONS = QUERY_CACHE_OPTIONS_BY_POLICY['cache-first']

const getRequestKey = (queryKey: Key, paramsKey: string | number) =>
  `${String(queryKey)}:${paramsKey}` // TODO change Key to string | number and remove String()?

type RefState<T, P, D> = {
  params: P
  paramsKey: string | number
  cacheKey: string
  requestKey: string
  latestHookRequestKey: string
  dataSelector?: (state: any) => QueryResponse<T, D> | undefined
}

export const useQuery = <
  T extends Typenames,
  Q extends Record<
    keyof Q,
    QueryInfo<T, ExtractQueryParams<Q[keyof Q]>, ExtractQueryResult<Q[keyof Q]>>
  >,
  P extends ExtractQueryParams<Q[keyof Q]>,
  D extends ExtractQueryResult<Q[keyof Q]>
>(
  cache: Cache<T, Q, any>,
  options: {
    query: keyof Q
    params: P
  } & Pick<QueryInfo<T, P, D>, 'cacheOptions' | 'mergeResults' | 'getCacheKey' | 'getParamsKey'>
) => {
  const {
    query: queryKey,
    params: hookParams,
    cacheOptions: cacheOptionsOrPolicy = cache.queries[queryKey].cacheOptions ??
      DEFAULT_QUERY_CACHE_OPTIONS,
    mergeResults = cache.queries[queryKey].mergeResults,
    getCacheKey = cache.queries[queryKey].getCacheKey ?? defaultGetParamsKey,
    getParamsKey = cache.queries[queryKey].getParamsKey ?? defaultGetParamsKey,
  } = options

  const cacheOptions =
    typeof cacheOptionsOrPolicy === 'string'
      ? QUERY_CACHE_OPTIONS_BY_POLICY[cacheOptionsOrPolicy]
      : cacheOptionsOrPolicy

  // Check values that should be set once.
  cache.options.runtimeErrorChecksEnabled &&
    (() => {
      ;(
        [
          ['cache', cache],
          ['cacheStateSelector', cache.cacheStateSelector],
          ['queryKey', queryKey],
          ['dataSelector', cache.queries[queryKey].dataSelector],
        ] as [key: string, value: any][]
      ).forEach((args) => useAssertValueNotChanged(...args))
    })()

  const store = useStore()

  const forceUpdate = useForceUpdate()

  const hookParamsKey = useMemo(() => getParamsKey(hookParams), [getParamsKey, hookParams])

  // Keeps most of local state.
  // Reference because state is changed not only by changing hook arguments, but also by calling fetch, and it should be done synchronously.
  const stateRef = useRef({} as RefState<T, P, D>)

  useMemo(() => {
    if (stateRef.current.paramsKey === hookParamsKey) return

    const dataSelectorImpl = cache.queries[queryKey].dataSelector

    const state = stateRef.current
    state.params = hookParams
    state.paramsKey = hookParamsKey
    state.cacheKey = getCacheKey(hookParams)
    state.requestKey = getRequestKey(queryKey, hookParamsKey)
    state.latestHookRequestKey = state.requestKey
    // @ts-ignore TODO
    state.dataSelector = dataSelectorImpl && ((state: any) => dataSelectorImpl(state, hookParams))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hookParamsKey])

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const responseFromSelector =
    stateRef.current.dataSelector && useSelector(stateRef.current.dataSelector)

  // Used only for running fetch on useEffect
  // const hookRequestKey = getRequestKey(queryKey, hookParamsKey)

  // Used for cancelling requests, also set when fetch called directly
  // const requestKeyRef = useRef(hookRequestKey)
  // requestKeyRef.current = hookRequestKey

  const queryStateSelector = useCallback(
    (state: any) => {
      console.log('[queryStateSelector]', {
        state,
        queryKey,
        cacheKey: stateRef.current.cacheKey,
        cacheState: cache.cacheStateSelector(state),
      })
      return cache.cacheStateSelector(state).queries[queryKey][stateRef.current.cacheKey]
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateRef.current.cacheKey]
  )

  const queryStateFromSelector = useSelector(queryStateSelector) ?? defaultEndpointState
  const queryState = responseFromSelector
    ? {
        ...queryStateFromSelector,
        data: responseFromSelector,
      }
    : queryStateFromSelector

  console.log('[useQuery]', {
    state: store.getState(),
    queryKey,
    refState: stateRef.current,
    cacheOptions,
    queryState,
    queryStateFromSelector,
  })

  const setQueryState = (newState: any, normalizedEntities?: any) =>
    setQueryStateImpl(
      newState,
      normalizedEntities,
      queryKey,
      stateRef.current.cacheKey,
      store,
      cache.cacheStateSelector
    )

  const fetchImpl = async () => {
    console.log('[useQuery.fetch]', {queryState, hookParams})

    if (queryState.loading) return

    const {requestKey} = stateRef.current

    cacheOptions.cacheQueryState && setQueryState({loading: true})

    let data
    const fetchFn = cache.queries[queryKey].query
    try {
      data = await fetchFn(stateRef.current.params)
    } catch (error) {
      if (stateRef.current.requestKey === requestKey && cacheOptions.cacheQueryState) {
        setQueryState({error, loading: false})
      }
    }

    if (data && stateRef.current.requestKey === requestKey) {
      setQueryState(
        cacheOptions.cacheQueryState
          ? {
              error: undefined,
              loading: false,
              data: responseFromSelector
                ? undefined
                : mergeResults
                ? mergeResults(
                    queryStateSelector(store.getState())?.data,
                    // @ts-ignore TODO
                    data.result,
                    data.entities
                  )
                : data.result,
            }
          : undefined,
        cacheOptions.cacheEntities ? data.entities : undefined
      )
    }
  }

  useEffect(() => {
    if (queryState.data && cacheOptions.policy === 'cache-first') {
      return
    }

    fetchImpl()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stateRef.current.latestHookRequestKey])

  const fetch = useCallback((params?: P) => {
    console.log('[fetch]', params)

    if (params !== undefined) {
      const state = stateRef.current
      const paramsKey = getParamsKey(params)

      if (state.paramsKey !== paramsKey) {
        const dataSelectorImpl = cache.queries[queryKey].dataSelector

        state.params = params
        state.paramsKey = paramsKey
        state.cacheKey = getCacheKey(params)
        state.requestKey = getRequestKey(queryKey, state.paramsKey)
        // @ts-ignore TODO
        state.dataSelector = dataSelectorImpl && ((state: any) => dataSelectorImpl(state, params))
        forceUpdate()
      }
    }

    return fetchImpl()
  }, [])

  return [queryState, fetch] as const
}

const setQueryStateImpl = (
  newState: any,
  normalizedEntities: any | undefined,
  queryKey: Key,
  cacheKey: string,
  store: Store,
  cacheStateSelector: any
) => {
  console.log('[setQueryStateImpl]', {
    newState,
    normalizedEntities,
    queryKey,
    cacheKey,
    store,
    cacheStateSelector,
  })

  if (!newState && !normalizedEntities) return

  const cacheState = cacheStateSelector(store.getState())
  store.dispatch(
    setStateAction({
      entities: shallowMerge(cacheState.entities, normalizedEntities),
      queries: {
        [queryKey]: shallowMerge(cacheState.queries[queryKey], {
          [cacheKey]: {
            ...cacheState.queries[queryKey][cacheKey],
            ...newState,
          },
        }),
      },
    })
  )
}
