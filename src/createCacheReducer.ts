import type {ActionMap} from './createActions'
import type {CacheOptions, Dict, EntitiesMap, MutationState, QueryState, Typenames} from './types'
import {applyEntityChanges, DEFAULT_QUERY_MUTATION_STATE, log, optionalUtils} from './utilsAndConstants'

export type ReduxCacheState<T extends Typenames, QP, QR, MP, MR> = ReturnType<
  ReturnType<typeof createCacheReducer<string, T, QP, QR, MP, MR>>
>

const EMPTY_QUERY_STATE = Object.freeze({})

const optionalQueryKeys: (keyof QueryState<unknown, unknown>)[] = ['error', 'expiresAt', 'result', 'params']

const optionalMutationKeys: (keyof MutationState<unknown, unknown>)[] = ['error', 'result', 'params']

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

  const queryStateMap = {} as {[QK in keyof (QP | QR)]: Dict<QueryState<QP[QK], QR[QK]>>}
  for (const key of queryKeys) {
    queryStateMap[key] = {}
  }

  const mutationStateMap = {} as {[MK in keyof (MP | MR)]: MutationState<MP[MK], MR[MK]>}

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

        // remove undefined optional fields
        if (newQueryState) {
          for (const key of optionalQueryKeys) {
            if (key in newQueryState && newQueryState[key] === undefined) {
              delete newQueryState[key]
            }
          }
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

        // remove undefined optional fields
        if (newMutationState) {
          for (const key of optionalMutationKeys) {
            if (key in newMutationState && newMutationState[key] === undefined) {
              delete newMutationState[key]
            }
          }
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
      case actions.invalidateQuery.type: {
        const {queries: queriesToInvalidate} = action as ReturnType<typeof actions.invalidateQuery>
        if (!queriesToInvalidate.length) {
          return state
        }

        const now = Date.now()
        let newQueries = undefined

        for (const {key, cacheKey, expiresAt = now} of queriesToInvalidate) {
          const queryStates = (newQueries ?? state.queries)[key]
          if (cacheKey != null) {
            if (queryStates[cacheKey]) {
              const queryState = queryStates[cacheKey]
              if (queryState && queryState.expiresAt !== expiresAt) {
                newQueries ??= {...state.queries}
                if (state.queries[key] === newQueries[key]) {
                  newQueries[key] = {
                    ...newQueries[key],
                  }
                }
                // @ts-expect-error fix type later
                newQueries[key][cacheKey] = {
                  ...queryState,
                  expiresAt,
                }
                if (expiresAt === undefined) {
                  delete newQueries[key][cacheKey].expiresAt
                }
              }
            }
          } else {
            for (const cacheKey in queryStates) {
              const queryState = queryStates[cacheKey]
              if (queryState && queryState.expiresAt !== expiresAt) {
                newQueries ??= {...state.queries}
                if (state.queries[key] === newQueries[key]) {
                  newQueries[key] = {
                    ...newQueries[key],
                  }
                }
                newQueries[key][cacheKey] = {
                  ...queryState,
                  expiresAt,
                }
                if (expiresAt === undefined) {
                  delete newQueries[key][cacheKey].expiresAt
                }
              }
            }
          }
        }

        return !newQueries
          ? state
          : {
              ...state,
              queries: newQueries,
            }
      }
      case actions.clearQueryState.type: {
        const {queries: queriesToClear} = action as ReturnType<typeof actions.clearQueryState>
        if (!queriesToClear.length) {
          return state
        }

        let newQueries = undefined

        for (const {key, cacheKey} of queriesToClear) {
          const queryStates = (newQueries ?? state.queries)[key]
          if (cacheKey != null) {
            if (queryStates[cacheKey]) {
              newQueries ??= {...state.queries}
              if (state.queries[key] === newQueries[key]) {
                newQueries[key] = {
                  ...newQueries[key],
                }
              }
              delete newQueries[key][cacheKey]
            }
          } else if (queryStates !== EMPTY_QUERY_STATE) {
            newQueries ??= {...state.queries}
            newQueries[key] = EMPTY_QUERY_STATE
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
