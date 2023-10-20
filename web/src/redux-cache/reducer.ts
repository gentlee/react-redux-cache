import {Cache, Dict, EntitiesMap, EntityChanges, QueryMutationState, Typenames} from './types'
import {PACKAGE_NAME, processEntityChanges} from './utilsAndConstants'

export type ReduxCacheState<T extends Typenames, QR extends object, MR extends object> = ReturnType<
  ReturnType<typeof createCacheReducer<T, QR, MR>>
>

export const createCacheReducer = <T extends Typenames, QR extends object, MR extends object>(
  typenames: Cache<T, QR, MR>['typenames'],
  queries: Cache<T, QR, MR>['queries'],
  mutations: Cache<T, QR, MR>['mutations'],
  cacheOptions: Cache<T, QR, MR>['options']
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

  cacheOptions.logsEnabled &&
    console.debug(`@${PACKAGE_NAME} [createCacheReducer]`, {
      typenames,
      queries,
      mutations,
      initialState,
    })

  return (
    state = initialState,
    action: ReturnType<
      | typeof setQueryStateAndEntities<T, QR, keyof QR>
      | typeof setMutationStateAndEntities<T, MR, keyof MR>
      | typeof mergeEntityChanges<T>
    >
  ): typeof initialState => {
    switch (action.type) {
      case '@redux-cache/SET_QUERY_STATE_AND_ENTITIES': {
        const {queryKey, queryCacheKey, state: queryState, entityChagnes} = action

        const newEntities =
          entityChagnes && processEntityChanges(state.entities, entityChagnes, cacheOptions)

        if (!queryState && !newEntities) return state

        return {
          ...state,
          ...(newEntities ? {entities: newEntities} : null),
          queries: {
            ...state.queries,
            [queryKey]: {
              ...state.queries[queryKey],
              [queryCacheKey]: {
                ...state.queries[queryKey][queryCacheKey],
                ...queryState,
              },
            },
          },
        }
      }
      case '@redux-cache/SET_MUTATION_STATE_AND_ENTITIES': {
        const {mutationKey, state: mutationState, entityChagnes} = action

        const newEntities =
          entityChagnes && processEntityChanges(state.entities, entityChagnes, cacheOptions)

        if (!mutationState && !newEntities) return state

        return {
          ...state,
          ...(newEntities ? {entities: newEntities} : null),
          mutations: {
            ...state.mutations,
            [mutationKey]: {
              ...state.mutations[mutationKey],
              ...mutationState,
            },
          },
        }
      }
      case '@redux-cache/MERGE_ENTITY_CHANGES': {
        const {changes} = action

        const newEntities = processEntityChanges(state.entities, changes, cacheOptions)

        return newEntities ? {...state, entities: newEntities} : state
      }
    }
    return state
  }
}

const actionPrefix = `@${PACKAGE_NAME}/`

export const setQueryStateAndEntities = <
  T extends Typenames,
  QR extends object,
  K extends keyof QR
>(
  queryKey: K,
  queryCacheKey: string,
  state?: Partial<QueryMutationState<QR[K]>>,
  entityChagnes?: EntityChanges<T>
) => ({
  type: `${actionPrefix}SET_QUERY_STATE_AND_ENTITIES` as const,
  queryKey,
  queryCacheKey,
  state,
  entityChagnes,
})

export const setMutationStateAndEntities = <
  T extends Typenames,
  MR extends object,
  K extends keyof MR
>(
  mutationKey: K,
  state?: Partial<QueryMutationState<MR[K]>>,
  entityChagnes?: EntityChanges<T>
) => ({
  type: `${actionPrefix}SET_MUTATION_STATE_AND_ENTITIES` as const,
  mutationKey,
  state,
  entityChagnes,
})

export const mergeEntityChanges = <T extends Typenames>(changes: EntityChanges<T>) => ({
  type: `${actionPrefix}MERGE_ENTITY_CHANGES` as const,
  changes,
})
