import { useEffect, useMemo, useCallback, useRef } from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { setStateAction } from 'redux-light'
import { InMemoryCache, NormalizedEntities, Response } from './types'
import { defaultCacheStateSelector, defaultEndpointState, defaultGetParamsKey, shallowMerge } from './utilsAndConstants'

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

export const useQuery = <
  Queries extends Record<QueryKey, Query>,
  StoreState = unknown,
  Cache extends InMemoryCache = InMemoryCache,
  QueryKey extends string = string,
  Data = any,
  Params extends Parameters<Queries[QueryKey]['query']> = any,
  QueryError = Error,
  Typename extends string = string,
  Entity = unknown
>({
  query: queryKey,
  params,
  cacheOptions: cacheOptionsOrPolicy,
  cache,
  getParamsKey = defaultGetParamsKey,
  cacheStateSelector = defaultCacheStateSelector
}: {
  query: QueryKey
  cacheOptions: QueryCacheOptions | QueryCachePolicy,
  cache: Cache
  params?: Params
  getParamsKey?: (params?: Params) => string,
  cacheStateSelector?: (state: StoreState) => {
    queries: Record<QueryKey, Record<string, QueryState<Data, QueryError>>>
    entities: NormalizedEntities<Entity, Typename>
  }
}) => {
  const cacheOptions = typeof cacheOptionsOrPolicy === 'string'
    ? cacheOptionsByPolicy[cacheOptionsOrPolicy]
    : cacheOptionsOrPolicy

  const dispatch = useDispatch()
  const store = useStore<StoreState>()

  const paramsKey = useMemo(() => getParamsKey(params), [getParamsKey, params])

  const dataSelectorImpl = cache.queries[queryKey].dataSelector

  // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/rules-of-hooks
  const dataSelector = dataSelectorImpl && useCallback((state: any) => dataSelectorImpl(state, params), [paramsKey])

  // dataSelector is set statically
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const responseFromSelector = dataSelector && useSelector(dataSelector)

  const requestKey = `${queryKey}:${paramsKey}`
  const requestKeyRef = useRef(requestKey)
  requestKeyRef.current = requestKey

  console.log('[useQuery]', {
    state: store.getState(),
    queryKey,
    paramsKey,
    params,
    cacheOptions,
    requestKey,
  })

  const queryStateSelector = useCallback(
    (state: StoreState) => {
      console.log('[queryStateSelector]', {
        state,
        queryKey,
        paramsKey,
        cacheState: cacheStateSelector(state)
      })
      return cacheStateSelector(state).queries[queryKey][paramsKey]
    },
    [queryKey, paramsKey, cacheStateSelector]
  )

  const queryStateFromSelector = useSelector(queryStateSelector) ?? defaultEndpointState
  const queryState = responseFromSelector ? {
    ...queryStateFromSelector,
    data: responseFromSelector
  } : queryStateFromSelector

  const setQueryState = (newState: any, normalizedEntities?: any) => {
    if (!newState && !normalizedEntities) return

    const cacheState = cacheStateSelector(store.getState())
    dispatch(setStateAction({
      // @ts-ignore
      entities: shallowMerge(cacheState.entities, normalizedEntities),
      queries: {
        [queryKey]: shallowMerge(cacheState.queries[queryKey], {
          [paramsKey]: {
            ...queryStateSelector(store.getState()),
            ...newState
          }
        })
      }
    }))
  }

  const fetch = async () => {
    console.log('[useQuery.fetch]', { queryState, requestKey })
    
    if (queryState.loading) return
    
    cacheOptions.cacheQueryState && setQueryState({ loading: true})

    let data
    const fetchFn = cache.queries[queryKey].query
    try {
      data = await fetchFn(params)
    } catch (error) {
      if (requestKeyRef.current === requestKey && cacheOptions.cacheQueryState) {
        setQueryState({ error, loading: false })
      }
    }

    if (data && requestKeyRef.current === requestKey) {
      setQueryState(
        cacheOptions.cacheQueryState ? {
          error: undefined,
          loading: false,
          data: responseFromSelector ? undefined : data.result
        } : undefined,
        cacheOptions.cacheEntities ? data.entities : undefined
      )
    }
  }

  useEffect(() => {
    if (queryState.data && cacheOptions.policy === 'cache-first') {
      return
    }

    fetch()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [requestKey])

  return [queryState, fetch] as const
}
