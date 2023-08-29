import {Store} from 'redux'
import {Query} from './useQuery'

export type Dict = Record<string, unknown>

export type EntityId = string | number

export type Response<Data, Entity = unknown, Typename extends string = string> = {
  result: Data
  entities: NormalizedEntities<Entity, Typename>
}

export type CacheOptions = {
  isDev: boolean
}

export type InMemoryCache<
  ReduxState extends Dict = Dict,
  Data = unknown,
  QueryParams = unknown,
  Queries extends Record<string, Query<QueryParams, Data, ReduxState>> = Record<
    string,
    Query<QueryParams, Data, ReduxState>
  >,
  Mutations extends Dict = Dict
> = {
  store: Store<ReduxState>
  queries: Queries
  mutations: Mutations
  options?: CacheOptions
}

export type NormalizedEntities<Entity = unknown, Typename extends string = string> = Record<
  Typename,
  Record<EntityId, Entity>
>
