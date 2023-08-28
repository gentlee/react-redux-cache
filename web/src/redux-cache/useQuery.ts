import { useEffect, useMemo, useCallback, useRef } from 'react'
import { useSelector } from 'react-redux'
import { setStateAction } from 'redux-light'
import { InMemoryCache, NormalizedEntities, Response } from './types'
import { defaultCacheStateSelector, defaultEndpointState, defaultGetParamsKey, isDev, shallowMerge, useAssertValueNotChanged, useForceUpdate } from './utilsAndConstants'
import { Store } from 'redux'

export type QueryState<Data, QueryError> = {
  loading: boolean
  data?: Data
  error?: QueryError
}

export type Query<QueryParams = unknown, Data = unknown, ReduxState = unknown> = {
  query: (params: QueryParams) => Promise<Response<Data>>
  dataSelector?: (state: ReduxState, params: QueryParams) => Response<Data>[] | undefined
}

export type QueryCachePolicy = 'cache-first' | 'cache-and-network'

export type QueryCacheOptions = {
  policy: QueryCachePolicy
  cacheQueryState: boolean
  cacheEntities: boolean
}

export const CacheFirstOptions = {
  policy: 'cache-first',
  cacheQueryState: true,
  cacheEntities: true,
} as const satisfies QueryCacheOptions

export const CacheAndNetworkOptions = {
  ...CacheFirstOptions,
  policy: 'cache-and-network',
} as const satisfies QueryCacheOptions

const cacheOptionsByPolicy: Record<QueryCachePolicy, QueryCacheOptions> = {
  'cache-first': CacheFirstOptions,
  'cache-and-network': CacheAndNetworkOptions
}

export const defaultIdSelector = (entity: any) => entity.id

const getRequestKey = (queryKey: string, paramsKey: string | number) => `${queryKey}:${paramsKey}`

type RefState<Params> = {
  params?: Params
  paramsKey: string | number
  cacheKey: string
  requestKey: string
  latestHookRequestKey: string
  dataSelector?: (state: any) => Response<any>[] | undefined
}

// TODO move fucntions to cache

export const useQuery = <
  StoreState = unknown,
  Cache extends InMemoryCache = InMemoryCache,
  QueryKey extends string = string,
  Data = any,
  Params = unknown,
  QueryError = Error,
  Typename extends string = string,
  Entity = unknown
>({
  query: queryKey,
  params: hookParams,
  cacheOptions: cacheOptionsOrPolicy,
  cache,
  mergeResults,
  getCacheKey = defaultGetParamsKey,
  getParamsKey = defaultGetParamsKey,
  cacheStateSelector = defaultCacheStateSelector
}: {
  query: QueryKey
  cacheOptions: QueryCacheOptions | QueryCachePolicy
  cache: Cache
  params?: Params
  mergeResults?: (oldResult: Data | undefined, newResult: Data, newEntities: NormalizedEntities<Entity, Typename>) => Data
  getCacheKey?: (params?: Params) => string
  getParamsKey?: (params?: Params) => string | number
  cacheStateSelector?: (state: StoreState) => {
    queries: Record<QueryKey, Record<string, QueryState<Data, QueryError>>>
    entities: NormalizedEntities<Entity, Typename>
  }
}) => {
  const forceUpdate = useForceUpdate()

  const cacheOptions = typeof cacheOptionsOrPolicy === 'string'
    ? cacheOptionsByPolicy[cacheOptionsOrPolicy]
    : cacheOptionsOrPolicy
  
  const hookParamsKey = useMemo(() => getParamsKey(hookParams), [getParamsKey, hookParams])
  
  // Keeps most of local state.
  // Reference because state is changed not only by changing hook arguments, but also by calling fetch.
  const stateRef = useRef({} as RefState<Params>)
  
  // Check values that should be set once.
  isDev && (() => {
    (
      [
        ['cache', cache],
        ['queryKey', queryKey],
        ['dataSelector', cache.queries[queryKey].dataSelector]
      ] as [key: string, value: any][]
    ).forEach(args => useAssertValueNotChanged.apply(undefined, args))
  })()
  
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

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const responseFromSelector = stateRef.current.dataSelector && useSelector(stateRef.current.dataSelector)

  // Used only for running fetch on useEffect
  // const hookRequestKey = getRequestKey(queryKey, hookParamsKey)

  // Used for cancelling requests, also set when fetch called directly
  // const requestKeyRef = useRef(hookRequestKey)
  // requestKeyRef.current = hookRequestKey

  const queryStateSelector = useCallback(
    (state: StoreState) => {
      console.log('[queryStateSelector]', {
        state,
        queryKey,
        cacheKey: stateRef.current.cacheKey,
        cacheState: cacheStateSelector(state)
      })
      return cacheStateSelector(state).queries[queryKey][stateRef.current.cacheKey]
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cacheStateSelector, stateRef.current.cacheKey]
  )

  const queryStateFromSelector = useSelector(queryStateSelector) ?? defaultEndpointState
  const queryState = responseFromSelector ? {
    ...queryStateFromSelector,
    data: responseFromSelector
  } : queryStateFromSelector

  console.log('[useQuery]', {
    state: cache.store.getState(),
    queryKey,
    refState: stateRef.current,
    cacheOptions,
    queryState,
    queryStateFromSelector
  })

  const setQueryState = (newState: any, normalizedEntities?: any) => setQueryStateImpl(newState, normalizedEntities, queryKey, stateRef.current.cacheKey, cache.store, cacheStateSelector)

  const fetchImpl = async () => {
    console.log('[useQuery.fetch]', { queryState, hookParams })

    if (queryState.loading) return
    
    const { requestKey } = stateRef.current
    
    cacheOptions.cacheQueryState && setQueryState({ loading: true})

    let data
    const fetchFn = cache.queries[queryKey].query
    try {
      data = await fetchFn(stateRef.current.params)
    } catch (error) {
      if (stateRef.current.requestKey === requestKey && cacheOptions.cacheQueryState) {
        setQueryState({ error, loading: false })
      }
    }

    if (data && stateRef.current.requestKey === requestKey) {
      setQueryState(
        cacheOptions.cacheQueryState ? {
          error: undefined,
          loading: false,
          data: responseFromSelector
            ? undefined
            : mergeResults
              // @ts-expect-error
              ? mergeResults(queryStateSelector(cache.store.getState())?.data, data.result, data.entities)
              : data.result
        } : undefined,
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

  const fetch = (params?: Params) => {
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
        state.dataSelector = dataSelectorImpl && ((state: any) => dataSelectorImpl(state, params))
        forceUpdate()
      }
    }

    return fetchImpl()
  }

  return [queryState, fetch] as const
}

const setQueryStateImpl = (newState: any, normalizedEntities: any | undefined, queryKey: string, cacheKey: string, store: Store, cacheStateSelector: any) => {
  console.log('[setQueryStateImpl]', {
    newState,
    normalizedEntities,
    queryKey,
    cacheKey,
    store,
    cacheStateSelector
  })

  if (!newState && !normalizedEntities) return

  const cacheState = cacheStateSelector(store.getState())
  store.dispatch(setStateAction({
    entities: shallowMerge(cacheState.entities, normalizedEntities),
    queries: {
      [queryKey]: shallowMerge(cacheState.queries[queryKey], {
        [cacheKey]: {
          ...cacheState.queries[queryKey][cacheKey],
          ...newState
        }
      })
    }
  }))
}


