import {createReducer} from 'redux-light'
import {PACKAGE_NAME} from './utilsAndConstants'
import {Cache, Dict, EntitiesMap, QueryMutationState, Typenames} from './types'

export type ReduxCacheState<T extends Typenames, QR extends object, MR extends object> = ReturnType<
  ReturnType<typeof createCacheReducer<T, QR, MR>>
>

export const createCacheReducer = <T extends Typenames, QR extends object, MR extends object>(
  typenames: Cache<T, QR, MR>['typenames'],
  queries: Cache<T, QR, MR>['queries'],
  mutations: Cache<T, QR, MR>['mutations'],
  logsEnabled: boolean
) => {
  const entitiesMap = {} as EntitiesMap<T>
  for (const key in typenames) {
    entitiesMap[key] = {}
  }

  const queriesMap = {} as {[QK in keyof QR]: Dict<QueryMutationState<QR[QK]>>}
  for (const key in queries) {
    queriesMap[key] = {}
  }

  const mutationsMap = {} as {[MK in keyof MR]: QueryMutationState<MR[MK]>}

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
