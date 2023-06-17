import { useEffect, useMemo, useCallback, useRef } from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { createReducer, setStateAction } from 'redux-light'

export type Typename = string

export type QueryResponse<TData> = TData[] | TData | Record<string | number, TData>

export type Query<TQueryParams = unknown, TData = unknown> = (
  params: TQueryParams
) => Promise<QueryResponse<TData>[]>

export type InMemoryCache<
  TQueries extends Record<string, Query> = Record<string, Query>
> = {
  queries: TQueries
}

export type CacheOptions = {
  policy: CachePolicy
  cacheQueryState: boolean
  cacheEntities: boolean
}

export type CachePolicy = 'cache-first' | 'cache-and-network'

export const CacheFirstOptions = {
  policy: 'cache-first',
  cacheQueryState: true,
  cacheEntities: true,
} as const satisfies CacheOptions

export const CacheAndNetworkOptions = {
  ...CacheFirstOptions,
  policy: 'cache-and-network',
} as const satisfies CacheOptions

const cacheOptionsByPolicy: Record<CachePolicy, CacheOptions> = {
  'cache-first': CacheFirstOptions,
  'cache-and-network': CacheAndNetworkOptions
}

export type EntityId = string | number

export type QueryState<TData, TError = unknown> = {
  loading: boolean
  data?: TData
  error?: TError
}

export type NormalizedData<TEntity = unknown, TTypename extends Typename = Typename> = {
  // @ts-ignore
  [key: TTypename]: Record<EntityId, TEntity>
}

export const defaultQueryState = { loading: false } as const

export const defaultGetParamsKey = (params: any) => JSON.stringify(params)

export const defaultCacheStateSelector = (state: any) => state

export const defaultIdSelector = (entity: any) => entity.id

export const createCacheReducer = (typenames: string[], endpoints: Record<string, any>) => {
  const initialState = {
    entities: Object.fromEntries(typenames.map(typename => [typename, {}])),
    endpoints: Object.fromEntries(Object.keys(endpoints).map(endpointKey => [endpointKey, {}]))
  }
  console.log('[createCacheReducer]', {
    typenames,
    endpoints,
    initialState
  })
  return createReducer({ initialState })
}

// TODO separate hook when no need for result cache
export const useQuery = <
  TCache,
  TQueries extends Record<TQueryKey, Query>,
  TQueryKey extends string = string,
  TData = any,
  TState = unknown,
  TCacheState = unknown,
  TParams extends Parameters<TQueries[TQueryKey]> = any
>({
  query: queryKey,
  params,
  cacheOptions: cacheOptionsOrPolicy,
  cache,
  getParamsKey = defaultGetParamsKey,
  cacheStateSelector = defaultCacheStateSelector
}: {
  query: TQueryKey
  params: TParams
  cacheOptions: CacheOptions | CachePolicy,
  cache: TCache
  getParamsKey: (params: TParams) => string,
  cacheStateSelector: (state: TState) => TCacheState
}) => {
  const cacheOptions = typeof cacheOptionsOrPolicy === 'string'
    ? cacheOptionsByPolicy[cacheOptionsOrPolicy]
    : cacheOptionsOrPolicy

  const dispatch = useDispatch()
  const store = useStore()

  const paramsKey = useMemo(() => getParamsKey(params), [getParamsKey, params])

  // @ts-ignore
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
    // @ts-ignore
    (state: ReduxState) => {
      console.log('[queryStateSelector]', {
        state,
        queryKey,
        paramsKey,
        cacheState: cacheStateSelector(state)
      })
      // @ts-ignore
      return cacheStateSelector(state).endpoints[queryKey][paramsKey] as QueryState<TData>
    },
    [queryKey, paramsKey, cacheStateSelector]
  )

  const queryStateFromSelector = useSelector(queryStateSelector) ?? defaultQueryState
  const queryState = responseFromSelector ? {
    ...queryStateFromSelector,
    data: responseFromSelector
  } : queryStateFromSelector

  const setQueryState = (newState: any, normalizedEntities?: any) => {
    if (!newState && !normalizedEntities) return

    dispatch(setStateAction({
      entities: {
        ...normalizedEntities,
      },
      endpoints: {
        [queryKey]: {
          [paramsKey]: {
            ...queryStateSelector(store.getState()),
            ...newState
          }
        }
      }
    }))
  }

  const fetch = async () => {
    console.log('[useQuery.fetch]', { queryState, requestKey })
    
    if (queryState.loading) return
    
    cacheOptions.cacheQueryState && setQueryState({ loading: true})

    let data
    // @ts-ignore
    const queryFn = cache.queries[queryKey].query
    try {
      // @ts-ignore
      data = await queryFn(params)
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
