import type {ActionMap} from './createActions'
import type {CacheOptions, Dict, EntitiesMap, QueryMutationState, Typenames} from './types'
import {
  applyEntityChanges,
  DEFAULT_QUERY_MUTATION_STATE,
  EMPTY_OBJECT,
  log,
  optionalUtils,
} from './utilsAndConstants'

export type ReduxCacheState<T extends Typenames, QP, QR, MP, MR> = ReturnType<
  ReturnType<typeof createCacheReducer<string, T, QP, QR, MP, MR>>
>

export const createCacheReducer = <N extends string, T extends Typenames, QP, QR, MP, MR>(
  actions: ActionMap<N, T, QP, QR, MP, MR>,
  queryKeys: (keyof (QP | QR))[],
  cacheOptions: CacheOptions
) => {
  const entitiesMap = {} as EntitiesMap<T>

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
      queryKeys,
      initialState,
    })

  const deepEqual = cacheOptions.deepComparisonEnabled ? optionalUtils.deepEqual : undefined

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
          entityChanges,
        } = action as ReturnType<typeof actions.updateQueryStateAndEntities>

        const oldQueryState = state.queries[queryKey][queryCacheKey] ?? DEFAULT_QUERY_MUTATION_STATE
        let newQueryState = queryState && {
          ...oldQueryState,
          ...queryState,
        }
        if (deepEqual?.(oldQueryState, newQueryState)) {
          newQueryState = undefined
        }

        const newEntities = entityChanges && applyEntityChanges(state.entities, entityChanges, cacheOptions)

        let newState
        if (newEntities) {
          newState ??= {...state}
          newState.entities = newEntities
        }
        if (newQueryState) {
          newState ??= {...state}
          newState.queries = {
            ...state.queries,
            [queryKey]: {
              ...state.queries[queryKey],
              [queryCacheKey]: newQueryState,
            },
          }
        }

        return newState ?? state
      }
      case actions.updateMutationStateAndEntities.type: {
        const {
          mutationKey,
          state: mutationState,
          entityChanges,
        } = action as ReturnType<typeof actions.updateMutationStateAndEntities>

        const oldMutationState = state.mutations[mutationKey] ?? DEFAULT_QUERY_MUTATION_STATE
        let newMutationState = mutationState && {
          ...oldMutationState,
          ...mutationState,
        }
        if (deepEqual?.(oldMutationState, newMutationState)) {
          newMutationState = undefined
        }

        const newEntities = entityChanges && applyEntityChanges(state.entities, entityChanges, cacheOptions)

        let newState
        if (newEntities) {
          newState ??= {...state}
          newState.entities = newEntities
        }
        if (newMutationState) {
          newState ??= {...state}
          newState.mutations = {
            ...state.mutations,
            [mutationKey]: newMutationState,
          }
        }

        return newState ?? state
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
          const queryState = (newQueries ?? state.queries)[query.key]
          if (query.cacheKey != null) {
            if (queryState[query.cacheKey]) {
              newQueries ??= {...state.queries}
              if (state.queries[query.key] === newQueries[query.key]) {
                newQueries[query.key] = {
                  ...newQueries[query.key],
                }
              }
              delete newQueries[query.key][query.cacheKey]
            }
          } else if (queryState !== EMPTY_OBJECT) {
            newQueries ??= {...state.queries}
            newQueries[query.key] = EMPTY_OBJECT
          }
        }

        return !newQueries
          ? state
          : {
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

        return !newMutations
          ? state
          : {
              ...state,
              mutations: newMutations,
            }
      }
    }
    return state
  }
}
