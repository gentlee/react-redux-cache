import { Query } from "./useQuery"

export type EntityId = string | number

export type Response<Data, Entity = unknown, Typename extends string = string> = {
  result: Data,
  entities: NormalizedEntities<Entity, Typename>
}

export type InMemoryCache<
  ReduxState = {},
  Data = unknown,
  QueryParams = unknown,
  Queries extends Record<string, Query<QueryParams, Data, ReduxState>> = Record<string, Query<QueryParams, Data, ReduxState>>
> = {
  queries: Queries
}

export type NormalizedEntities<Entity = unknown, Typename extends string = string> = Record<Typename, Record<EntityId, Entity>>
