import {createReducer} from 'redux-light'
import {PACKAGE_NAME} from './utilsAndConstants'
import {
  Dict,
  EntitiesMap,
  ExtractMutationResult,
  ExtractQueryResult,
  MutationInfo,
  QueryInfo,
  QueryMutationState,
  Typenames,
} from './types'

export type ReduxCacheState = ReturnType<ReturnType<typeof createCacheReducer>>

export const createCacheReducer = <
  T extends Typenames,
  Q extends Record<keyof Q, QueryInfo<T, any, any>>,
  M extends Record<keyof M, MutationInfo<T, any, any>>
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

  const queriesMap = {} as Record<keyof Q, Dict<QueryMutationState<ExtractQueryResult<Q, keyof Q>>>>
  for (const key in queries) {
    queriesMap[key] = {}
  }

  const mutationsMap = {} as Record<keyof M, QueryMutationState<ExtractMutationResult<M, keyof M>>>

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
