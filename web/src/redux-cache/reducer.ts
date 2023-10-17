import {createReducer} from 'redux-light'
import {PACKAGE_NAME} from './utilsAndConstants'
import {
  Cache,
  Dict,
  EntitiesMap,
  ExtractMutationResult,
  ExtractQueryResult,
  MutationInfo,
  QueryInfo,
  QueryMutationState,
  Typenames,
} from './types'

export type ReduxCacheState<
  T extends Typenames,
  QP extends object,
  M extends Record<keyof M, MutationInfo<T, any, any>>
> = ReturnType<ReturnType<typeof createCacheReducer<T, QP, M>>>

export const createCacheReducer = <
  T extends Typenames,
  QP extends object,
  M extends Record<keyof M, MutationInfo<T, any, any>>
>(
  typenames: Cache<T, QP, M>['typenames'],
  queries: Cache<T, QP, M>['queries'],
  mutations: Cache<T, QP, M>['mutations'],
  logsEnabled: boolean
) => {
  const entitiesMap = {} as EntitiesMap<T>
  for (const key in typenames) {
    entitiesMap[key] = {}
  }

  const queriesMap = {} as {[QK in keyof QP]: Dict<QueryMutationState<any>>}
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
