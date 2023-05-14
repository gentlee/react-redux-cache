import { useEffect, useMemo, useCallback } from 'react'
import { createStore, applyMiddleware } from 'redux'
import { useSelector } from 'react-redux'
import { createReducer, setStateAction, StateChange } from 'redux-light'
import logger from 'redux-logger'

export type Typename = string

export type Entity<TTypename extends Typename> = {
  __typename: TTypename
}

export type QueryResponse<TData> = TData[] | TData | Record<string | number, TData>

export type Query<TQueryParams = unknown, TData = unknown> = (
  params: TQueryParams
) => Promise<QueryResponse<TData>[]>

export type InMemoryCache<
  TEntity extends Entity<any>,
  TQueries extends Record<string, Query> = Record<string, Query>
> = {
  idSelectors?: Partial<{
    [K in TEntity['__typename']]: (entity: Extract<TEntity, { __typename: K }>) => string | number
  }>
  queries: TQueries
}

export type CachePolicy = 'cache-first' | 'cache-and-network'

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

export const defaultGetRequestKey = (query: any, params: any) => query + JSON.stringify(params)

export const defaultIdSelector = (entity: any) => entity.id

export const reducer = createReducer({
  initialState: {
    ['Item1' as Typename]: {},
    ['Item2' as Typename]: {},
    'getEntity{"id":1}': {
      loading: false,
    },
  } as {
    'getEntity{"id":1}': QueryState<any>
  } & NormalizedData,
})

export const store = createStore(reducer, applyMiddleware(logger))

export const setState = (state: StateChange<ReduxState>) => store.dispatch(setStateAction(state))

export type ReduxState = ReturnType<typeof reducer>

export const useQuery = <
  TCache extends InMemoryCache<TEntity, TQueries>,
  TEntity extends Entity<any>,
  TQueries extends Record<string, Query>,
  TData = any,
  TQueryKey extends keyof TQueries = any,
  TParams extends Parameters<TQueries[TQueryKey]> = any
>({
  query,
  params,
  cachePolicy,
  cache,
  getRequestKey = defaultGetRequestKey,
}: {
  query: TQueryKey
  params: TParams
  cachePolicy: CachePolicy
  cache: TCache
  getRequestKey: (query: TQueryKey, params: TParams) => string
}) => {
  const queryKey = useMemo(() => getRequestKey(query, params), [query, params])

  const queryStateSelector = useCallback(
    // @ts-ignore
    (state: ReduxState) => state[queryKey] as QueryState<TData>,
    [queryKey]
  )

  const queryState = useSelector(queryStateSelector)

  const fetch = async () => {
    console.log('[useQuery.fetch]', { queryState })
    
    if (queryState.loading) return
    
    setState({ [queryKey]: { loading: true } })

    let data: TData
    try {
      // @ts-ignore
      data = await cache.queries[query](params)
    } catch (error) {
      setState({ [queryKey]: { error, loading: false } })
    }

    // @ts-ignore
    const [normalizedResponse, normalizedEntities] = normalizeData(data, cache.idSelectors)

    setState({
      ...normalizedEntities,
      // @ts-ignore
      [queryKey]: { error: undefined, loading: false, data: normalizedResponse },
    })
  }

  useEffect(() => {
    if (queryState.data && cachePolicy === 'cache-first') {
      return
    }

    fetch()
  }, [])

  console.log('[useQuery]', { queryKey, queryState, query, params, cachePolicy, cache })

  return [queryState, fetch] as const
}

export const normalizeData = <TEntity = any>(
  data: QueryResponse<TEntity>,
  idSelectors?: Record<Typename, (entity: TEntity) => EntityId>,
  normalizedEntities: NormalizedData<TEntity> = {}
) => {
  // TODO create compound ids instead of objects like 'typename:id', or transform it while persisting
  let normalizedResponse: undefined | QueryResponse<{ id: EntityId; __typename: Typename }> =
    undefined

  if (Array.isArray(data)) {
    normalizedResponse = []

    for (const item of data) {
      const result = normalizeData(item, idSelectors, normalizedEntities)
      // @ts-ignore
      normalizedResponse.push(result[0])
    }
  } else if (typeof data === 'object') {
    if ('__typename' in data!) {
      const normalizedEntity = mergeEntity(normalizedEntities, data, idSelectors)
      if (normalizedEntity) {
        normalizedResponse = normalizedEntity
      }
    } else {
      normalizedResponse = {}
      
      for (let key in data) {
        // @ts-ignore
        const value = data[key]

        if (!('__typename' in value) || key !== (idSelectors?.[value.__typename] ?? defaultIdSelector)(value)) {
          console.log('Normalized object is not an entity dictionary', value)
          break
        }
  
        // @ts-ignore
        const normalizedEntity = mergeEntity(normalizedEntities, value, idSelectors)
        if (normalizedEntity) {
          normalizedResponse[key] = normalizedEntity
        }
      }
    }
  } else {
    throw new Error('Expected data to be array or object, received: ' + typeof data)
  }

  console.log('[normalizeData]', { data, normalizedEntities, normalizedResponse });

  return [normalizedResponse, normalizedEntities]
}

export const mergeEntity = (entitiesByTypename: any, entity: any, idSelectors: any) => {
  const __typename = entity.__typename

  if (!__typename) return

  let entities = entitiesByTypename[__typename]
  if (!entities) {
    entities = {}
    entitiesByTypename[__typename] = entities
  }

  const id = (idSelectors?.[__typename] ?? defaultIdSelector)(entity)
  entities[id] = {
    ...entities[id],
    entity,
  }

  return { id, __typename }
}
