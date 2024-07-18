import {
  clearMutationState,
  clearQueryState,
  mergeEntityChanges,
  updateMutationStateAndEntities,
  updateQueryStateAndEntities,
} from './actions'
import type {Cache, Dict, EntitiesMap, QueryMutationState, Typenames} from './types'
import {applyEntityChanges, DEFAULT_QUERY_MUTATION_STATE, log} from './utilsAndConstants'

export type ReduxCacheState<T extends Typenames, QP, QR, MP, MR> = ReturnType<
  ReturnType<typeof createCacheReducer<T, QP, QR, MP, MR>>
>

const EMPTY_QUERY_STATE = Object.freeze({})

export const createCacheReducer = <T extends Typenames, QP, QR, MP, MR>(
  typenames: Cache<T, QP, QR, MP, MR>['typenames'],
  queries: Cache<T, QP, QR, MP, MR>['queries'],
  mutations: Cache<T, QP, QR, MP, MR>['mutations'],
  cacheOptions: Cache<T, QP, QR, MP, MR>['options']
) => {
  const entitiesMap = {} as EntitiesMap<T>
  for (const key in typenames) {
    entitiesMap[key] = EMPTY_QUERY_STATE
  }

  const queriesMap = {} as {[QK in keyof QR]: Dict<QueryMutationState<QR[QK]>>}
  for (const key in queries) {
    queriesMap[key as keyof QR] = {}
  }

  const mutationsMap = {} as {[MK in keyof MR]: QueryMutationState<MR[MK]>}

  const initialState = {
    entities: entitiesMap,
    queries: queriesMap,
    mutations: mutationsMap,
  }

  cacheOptions.logsEnabled &&
    log('createCacheReducer', {
      typenames,
      queries,
      mutations,
      initialState,
    })

  return (
    state = initialState,
    action: ReturnType<
      | typeof updateQueryStateAndEntities<T, QR, keyof QR>
      | typeof updateMutationStateAndEntities<T, MR, keyof MR>
      | typeof mergeEntityChanges<T>
      | typeof clearQueryState<QR, keyof QR>
      | typeof clearMutationState<MR, keyof MR>
    >
  ): typeof initialState => {
    switch (action.type) {
      case '@RRC/UPDATE_QUERY_STATE_AND_ENTITIES': {
        const {queryKey, queryCacheKey, state: queryState, entityChagnes} = action

        const newEntities =
          entityChagnes && applyEntityChanges(state.entities, entityChagnes, cacheOptions)

        if (!queryState && !newEntities) {
          return state
        }

        return {
          ...state,
          ...(newEntities ? {entities: newEntities} : null),
          queries: {
            ...state.queries,
            [queryKey]: {
              ...state.queries[queryKey],
              [queryCacheKey]: {
                ...(state.queries[queryKey][queryCacheKey] ?? DEFAULT_QUERY_MUTATION_STATE),
                ...queryState,
              },
            },
          },
        }
      }
      case '@RRC/UPDATE_MUTATION_STATE_AND_ENTITIES': {
        const {mutationKey, state: mutationState, entityChagnes} = action

        const newEntities =
          entityChagnes && applyEntityChanges(state.entities, entityChagnes, cacheOptions)

        if (!mutationState && !newEntities) {
          return state
        }

        return {
          ...state,
          ...(newEntities ? {entities: newEntities} : null),
          mutations: {
            ...state.mutations,
            [mutationKey]: {
              ...(state.mutations[mutationKey] ?? DEFAULT_QUERY_MUTATION_STATE),
              ...mutationState,
            },
          },
        }
      }
      case '@RRC/MERGE_ENTITY_CHANGES': {
        const {changes} = action

        const newEntities = applyEntityChanges(state.entities, changes, cacheOptions)

        return newEntities ? {...state, entities: newEntities} : state
      }
      case '@RRC/CLEAR_QUERY_STATE': {
        const {queryKeys} = action
        if (!queryKeys.length) {
          return state
        }

        let newQueries = undefined

        for (const query of queryKeys) {
          if (query.cacheKey != null) {
            if ((newQueries ?? state.queries)[query.key][query.cacheKey]) {
              newQueries ??= {...state.queries}
              newQueries[query.key] = {
                ...newQueries[query.key],
              }
              delete newQueries[query.key][query.cacheKey]
            }
          } else if ((newQueries ?? state.queries)[query.key] !== EMPTY_QUERY_STATE) {
            newQueries ??= {...state.queries}
            newQueries[query.key] = EMPTY_QUERY_STATE
          }
        }

        if (!newQueries) {
          return state
        }

        return {
          ...state,
          queries: newQueries,
        }
      }
      case '@RRC/CLEAR_MUTATION_STATE': {
        const {mutationKeys} = action

        if (!mutationKeys.length) {
          return state
        }

        let newMutations = undefined

        for (const mutation of mutationKeys) {
          if (state.mutations[mutation]) {
            newMutations ??= {...state.mutations}
            delete newMutations[mutation]
          }
        }

        if (!newMutations) {
          return state
        }

        return {
          ...state,
          mutations: newMutations,
        }
      }
    }
    return state
  }
}
