import {useEffect, useMemo, useCallback, useRef} from 'react'
import {useSelector, useStore} from 'react-redux'
import {setStateAction} from 'redux-light'
import {
  Cache,
  Key,
  Query,
  QueryCacheOptions,
  QueryCachePolicy,
  QueryInfo,
  QueryMutationState,
  QueryResponse,
  Typenames,
} from './types'
import {
  defaultEndpointState,
  defaultGetParamsKey,
  mergeResponseToEntities,
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
  'cache-and-network': {
    ...CACHE_FIRST_OPTIONS,
    policy: 'cache-and-network',
  },
} as const

export const DEFAULT_QUERY_CACHE_OPTIONS = QUERY_CACHE_OPTIONS_BY_POLICY['cache-first']

const getRequestKey = (queryKey: Key, paramsKey: string | number) =>
  `${String(queryKey)}:${paramsKey}` // TODO change Key to string | number and remove String()?

type RefState<P, D> = {
  params: P
  paramsKey: string | number
  cacheKey: string
  requestKey: string
  latestHookRequestKey: string
  dataSelector?: (state: any) => D | undefined
}

export const useQuery = <T extends Typenames, Q extends Query<T, any, any>>(
  cache: Cache<T, any, any>,
  options: {
    query: Q
    params: Q extends Query<T, infer P, any> ? P : never
    skip?: boolean
  } & Pick<
    QueryInfo<
      T,
      Q extends Query<T, infer P, any> ? P : never,
      Q extends Query<T, any, infer D> ? D : never
    >,
    'cacheOptions' | 'mergeResults' | 'getCacheKey' | 'getParamsKey'
  >
) => {
  type P = Q extends Query<T, infer P, any> ? P : never
  type D = Q extends Query<T, any, infer D> ? D : never

  const queryKey = useMemo(() => {
    const queryKeys = Object.keys(cache.queries)
    for (const key of queryKeys) {
      if (cache.queries[key].query === options.query) {
        return key
      }
    }
    throw new Error(`Can't find query function in cache.queries.`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    skip,
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

  const store = useStore()

  // Check values that should be set once.
  cache.options.runtimeErrorChecksEnabled &&
    (() => {
      ;(
        [
          ['store', store],
          ['cache', cache],
          ['cache.options.logsEnabled', cache.options.logsEnabled],
          ['cache.options.runtimeErrorChecksEnabled', cache.options.runtimeErrorChecksEnabled],
          ['cache.queries', cache.queries],
          ['cacheStateSelector', cache.cacheStateSelector],
          ['cacheOptions.cacheEntities', cacheOptions.cacheEntities],
          ['cacheOptions.cacheQueryState', cacheOptions.cacheQueryState],
          ['options.query', options.query],
          ['queryKey', queryKey],
          ['dataSelector', cache.queries[queryKey].dataSelector],
        ] as [key: string, value: any][]
      )
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .forEach((args) => useAssertValueNotChanged(...args))
    })()

  const forceUpdate = useForceUpdate()

  const hookParamsKey = useMemo(() => getParamsKey(hookParams), [getParamsKey, hookParams])

  // Keeps most of local state.
  // Reference because state is changed not only by changing hook arguments, but also by calling fetch, and it should be done synchronously.
  const stateRef = useRef({} as RefState<P, D>)

  useMemo(() => {
    if (stateRef.current.paramsKey === hookParamsKey) return

    const dataSelectorImpl = cache.queries[queryKey].dataSelector

    const state = stateRef.current
    state.params = hookParams
    state.paramsKey = hookParamsKey
    state.cacheKey = getCacheKey(hookParams)
    state.requestKey = getRequestKey(queryKey, hookParamsKey)
    state.latestHookRequestKey = state.requestKey
    state.dataSelector = dataSelectorImpl && ((state: any) => dataSelectorImpl(state, hookParams))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hookParamsKey])

  const responseFromSelector =
    // eslint-disable-next-line react-hooks/rules-of-hooks
    stateRef.current.dataSelector && useSelector(stateRef.current.dataSelector)

  // no useCallback because deps are empty
  const queryStateSelector = (state: any) => {
    cache.options.logsEnabled &&
      console.log('[queryStateSelector]', {
        state,
        queryKey,
        cacheKey: stateRef.current.cacheKey,
        cacheState: cache.cacheStateSelector(state),
      })
    const queryState = cache.cacheStateSelector(state).queries[queryKey][stateRef.current.cacheKey]
    return queryState as QueryMutationState<D> | undefined // TODO proper type
  }

  const queryStateFromSelector =
    useSelector(queryStateSelector) ?? (defaultEndpointState as QueryMutationState<D>)
  const queryState = responseFromSelector
    ? {
        ...queryStateFromSelector,
        data: responseFromSelector,
      }
    : queryStateFromSelector

  cache.options.logsEnabled &&
    console.log('[useQuery]', {
      state: store.getState(),
      queryKey,
      refState: stateRef.current,
      cacheOptions,
      queryState,
      queryStateFromSelector,
    })

  // no useCallback because deps are empty
  const setQueryState = (
    newState: Partial<QueryMutationState<D>> | undefined,
    response?: QueryResponse<T, D>
  ) => {
    const cacheKey = stateRef.current.cacheKey

    cache.options.logsEnabled &&
      console.log('[setQueryStateImpl]', {
        newState,
        response,
        queryKey,
        cacheKey: stateRef.current.cacheKey,
      })

    const cacheState = cache.cacheStateSelector(store.getState())
    const entities = cacheState.entities
    const newEntities = response && mergeResponseToEntities(entities, response, cache.options)

    if (!newState && !newEntities) return

    store.dispatch(
      // @ts-ignore fix later
      setStateAction({
        ...(newEntities ? {entities: newEntities} : null),
        queries: {
          [queryKey]: {
            ...cacheState.queries[queryKey],
            [cacheKey]: {
              ...cacheState.queries[queryKey][cacheKey],
              ...newState,
            },
          },
        },
      })
    )
  }

  const fetchImpl = useCallback(async () => {
    cache.options.logsEnabled && console.log('[useQuery.fetch]', {queryState})

    if (queryState.loading) return

    const {requestKey} = stateRef.current

    cacheOptions.cacheQueryState && setQueryState({loading: true})

    let response
    const fetchFn = cache.queries[queryKey].query
    try {
      response = await fetchFn(stateRef.current.params)
    } catch (error) {
      if (stateRef.current.requestKey === requestKey && cacheOptions.cacheQueryState) {
        setQueryState({error: error as Error, loading: false})
      }
    }

    if (response && stateRef.current.requestKey === requestKey) {
      setQueryState(
        !cacheOptions.cacheQueryState
          ? undefined
          : {
              error: undefined,
              loading: false,
              data: responseFromSelector
                ? undefined
                : mergeResults
                ? mergeResults(queryStateSelector(store.getState())?.data, response)
                : response.result,
            },
        cacheOptions.cacheEntities ? response : undefined
      )
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mergeResults, queryState.loading, !!responseFromSelector])

  useEffect(() => {
    if (skip) {
      return
    }
    if (queryState.data && cacheOptions.policy === 'cache-first') {
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
        const paramsKey = getParamsKey(params)

        if (state.paramsKey !== paramsKey) {
          const dataSelectorImpl = cache.queries[queryKey].dataSelector

          state.params = params
          state.paramsKey = paramsKey
          state.cacheKey = getCacheKey(params)
          state.requestKey = getRequestKey(queryKey, state.paramsKey)
          // @ts-ignore
          state.dataSelector = dataSelectorImpl && ((state: any) => dataSelectorImpl(state, params))

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
