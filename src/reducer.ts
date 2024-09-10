import type {ActionMap} from './createActions'
import type {CacheOptions, Dict, EntitiesMap, QueryMutationState, Typenames} from './types'
import {applyEntityChanges, DEFAULT_QUERY_MUTATION_STATE, log} from './utilsAndConstants'

export type ReduxCacheState<T extends Typenames, QP, QR, MP, MR> = ReturnType<
  ReturnType<typeof createCacheReducer<string, T, QP, QR, MP, MR>>
>

const EMPTY_QUERY_STATE = Object.freeze({})

export const createCacheReducer = <N extends string, T extends Typenames, QP, QR, MP, MR>(
  actions: ActionMap<N, T, QP, QR, MP, MR>,
  typenames: T,
  queryKeys: (keyof (QP | QR))[],
  cacheOptions: CacheOptions
) => {
  const entitiesMap = {} as EntitiesMap<T>
  for (const key in typenames) {
    entitiesMap[key] = EMPTY_QUERY_STATE
  }

  const queryStateMap = {} as {[QK in keyof (QP | QR)]: Dict<QueryMutationState<QP[QK], QR[QK]>>}
  for (const key of queryKeys) {
    queryStateMap[key] = {}
  }

  const mutationStateMap = {} as {[MK in keyof (MP | MR)]: QueryMutationState<MP[MK], MR[MK]>}

  const initialState = {
    entities: entitiesMap,
    queries: queryStateMap,
    mutations: mutationStateMap,
  }

  cacheOptions.logsEnabled &&
    log('createCacheReducer', {
      typenames,
      queryKeys,
      initialState,
    })

  return (
    state = initialState,
    action: ReturnType<(typeof actions)[keyof typeof actions]>
  ): typeof initialState => {
    switch (action.type) {
      case actions.updateQueryStateAndEntities.type: {
        const {
          queryKey,
          queryCacheKey,
          state: queryState,
          entityChagnes,
        } = action as ReturnType<typeof actions.updateQueryStateAndEntities>

        const newEntities = entityChagnes && applyEntityChanges(state.entities, entityChagnes, cacheOptions)

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
      case actions.updateMutationStateAndEntities.type: {
        const {
          mutationKey,
          state: mutationState,
          entityChagnes,
        } = action as ReturnType<typeof actions.updateMutationStateAndEntities>

        const newEntities = entityChagnes && applyEntityChanges(state.entities, entityChagnes, cacheOptions)

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
      case actions.mergeEntityChanges.type: {
        const {changes} = action as ReturnType<typeof actions.mergeEntityChanges>

        const newEntities = applyEntityChanges(state.entities, changes, cacheOptions)

        return newEntities ? {...state, entities: newEntities} : state
      }
      case actions.clearQueryState.type: {
        const {queryKeys: queryKeysToClear} = action as ReturnType<typeof actions.clearQueryState>
        if (!queryKeysToClear.length) {
          return state
        }

        let newQueries = undefined

        for (const query of queryKeysToClear) {
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
      case actions.clearMutationState.type: {
        const {mutationKeys} = action as ReturnType<typeof actions.clearMutationState>

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
