import {createReducer} from 'redux-light'
import {PACKAGE_NAME} from './utilsAndConstants'
import {
  Dict,
  EntitiesMap,
  ExtractQueryParams,
  ExtractQueryResult,
  Mutation,
  QueryInfo,
  QueryMutationState,
  Typenames,
} from './types'

export const createCacheReducer = <
  T extends Typenames,
  Q extends Record<
    keyof Q,
    QueryInfo<T, ExtractQueryParams<Q[keyof Q]>, ExtractQueryResult<Q[keyof Q]>>
  >,
  M extends Record<keyof M, Mutation<T>>
>(
  typenames: T,
  queries: Q,
  mutations: M,
  logsEnabled: boolean
) => {
  const entitiesMap = {} as EntitiesMap<T>
  for (const key in typenames) {
    entitiesMap[key] = {}
  }

  const queriesMap = {} as Record<
    keyof Q,
    Dict<QueryMutationState<Awaited<ReturnType<Q[keyof Q]['query']>>['result']>>
  >
  for (const key in queries) {
    queriesMap[key] = {}
  }

  const mutationsMap = {} as Record<
    keyof M,
    Dict<QueryMutationState<Awaited<ReturnType<M[keyof M]>>['result']>>
  >
  for (const key in mutations) {
    mutationsMap[key] = {}
  }

  const initialState = {
    entities: entitiesMap,
    queries: queriesMap,
    mutations: mutationsMap,
  }
  logsEnabled &&
    console.debug(`@${PACKAGE_NAME} [createCacheReducer]`, {
      typenames,
      queries,
      mutations,
      initialState,
    })
  return createReducer({initialState})
}
