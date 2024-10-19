import type {Actions} from './createActions'
import type {CacheOptions, Dict, EntitiesMap, MutationState, QueryState, Typenames} from './types'
import {applyEntityChanges, EMPTY_OBJECT, isEmptyObject, log, optionalUtils} from './utilsAndConstants'

export type ReduxCacheState<T extends Typenames, QP, QR, MP, MR> = ReturnType<
  ReturnType<typeof createCacheReducer<string, T, QP, QR, MP, MR>>
>

const optionalQueryKeys: (keyof QueryState<unknown, unknown>)[] = ['error', 'expiresAt', 'result', 'params']

const optionalMutationKeys: (keyof MutationState<unknown, unknown>)[] = ['error', 'result', 'params']

export const createCacheReducer = <N extends string, T extends Typenames, QP, QR, MP, MR>(
  actions: Actions<N, T, QP, QR, MP, MR>,
  queryKeys: (keyof (QP | QR))[],
  cacheOptions: CacheOptions
) => {
  const entitiesMap = {} as EntitiesMap<T>

  const queryStateMap = {} as {[QK in keyof (QP | QR)]: Dict<QueryState<QP[QK], QR[QK]> | undefined>}
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

        const oldQueryState = state.queries[queryKey][queryCacheKey]
        let newQueryState = queryState && {
          ...oldQueryState,
          ...queryState,
        }

        if (newQueryState) {
          // remove undefined optional fields
          for (const key of optionalQueryKeys) {
            if (key in newQueryState && newQueryState[key] === undefined) {
              delete newQueryState[key]
            }
          }
          if ('loading' in newQueryState && !newQueryState.loading) {
            delete newQueryState.loading
          }

          // skip if new state deep equals to the old state
          if (deepEqual?.(oldQueryState ?? EMPTY_OBJECT, newQueryState)) {
            newQueryState = undefined
          }
        }

        const newEntities = entityChanges && applyEntityChanges(state.entities, entityChanges, cacheOptions)

        let newState
        if (newEntities) {
          newState ??= {...state}
          newState.entities = newEntities
        }
        if (newQueryState) {
          if (!isEmptyObject(newQueryState)) {
            newState ??= {...state}
            newState.queries = {
              ...state.queries,
              [queryKey]: {
                ...state.queries[queryKey],
                [queryCacheKey]: newQueryState,
              },
            }
          } else if (oldQueryState !== undefined) {
            // empty states are removed
            const {[queryCacheKey]: _, ...withoutCacheKey} = state.queries[queryKey]
            newState ??= {...state}
            newState.queries = {...state.queries, [queryKey]: withoutCacheKey}
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

        const oldMutationState = state.mutations[mutationKey]
        let newMutationState = mutationState && {
          ...oldMutationState,
          ...mutationState,
        }

        if (newMutationState) {
          // remove optional fields with default values
          for (const key of optionalMutationKeys) {
            if (key in newMutationState && newMutationState[key] === undefined) {
              delete newMutationState[key]
            }
          }
          if ('loading' in newMutationState && !newMutationState.loading) {
            delete newMutationState.loading
          }

          // skip if new state deep equals to the old state
          if (deepEqual?.(oldMutationState ?? EMPTY_OBJECT, newMutationState)) {
            newMutationState = undefined
          }
        }

        const newEntities = entityChanges && applyEntityChanges(state.entities, entityChanges, cacheOptions)

        let newState
        if (newEntities) {
          newState ??= {...state}
          newState.entities = newEntities
        }
        if (newMutationState) {
          if (!isEmptyObject(newMutationState)) {
            newState ??= {...state}
            newState.mutations = {
              ...state.mutations,
              [mutationKey]: newMutationState,
            }
          } else if (oldMutationState !== undefined) {
            // empty states are removed
            const {[mutationKey]: _, ...withoutMutationKey} = state.mutations
            newState ??= {...state}
            newState.mutations = withoutMutationKey as typeof state.mutations
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
        if (queriesToInvalidate.length === 0) {
          return state
        }

        const now = Date.now()
        let newQueries = undefined

        for (const {query: queryKey, cacheKey, expiresAt = now} of queriesToInvalidate) {
          const queryStates = (newQueries ?? state.queries)[queryKey]
          if (cacheKey != null) {
            if (queryStates[cacheKey]) {
              const queryState = queryStates[cacheKey]
              if (queryState && queryState.expiresAt !== expiresAt) {
                newQueries ??= {...state.queries}
                if (state.queries[queryKey] === newQueries[queryKey]) {
                  newQueries[queryKey] = {
                    ...newQueries[queryKey],
                  }
                }
                // @ts-expect-error fix type later
                newQueries[queryKey][cacheKey] = {
                  ...queryState,
                  expiresAt,
                }
                if (expiresAt === undefined) {
                  delete newQueries[queryKey][cacheKey]!.expiresAt
                }
              }
            }
          } else {
            for (const cacheKey in queryStates) {
              const queryState = queryStates[cacheKey]
              if (queryState && queryState.expiresAt !== expiresAt) {
                newQueries ??= {...state.queries}
                if (state.queries[queryKey] === newQueries[queryKey]) {
                  newQueries[queryKey] = {
                    ...newQueries[queryKey],
                  }
                }
                newQueries[queryKey][cacheKey] = {
                  ...queryState,
                  expiresAt,
                }
                if (expiresAt === undefined) {
                  delete newQueries[queryKey][cacheKey]!.expiresAt
                }
              }
            }
          }
        }

        return newQueries === undefined
          ? state
          : {
              ...state,
              queries: newQueries,
            }
      }
      case actions.clearQueryState.type: {
        const {queries: queriesToClear} = action as ReturnType<typeof actions.clearQueryState>
        if (queriesToClear.length === 0) {
          return state
        }

        let newQueries = undefined

        for (const {query: queryKey, cacheKey} of queriesToClear) {
          const queryStates = (newQueries ?? state.queries)[queryKey]
          if (cacheKey != null) {
            if (queryStates[cacheKey]) {
              newQueries ??= {...state.queries}
              if (state.queries[queryKey] === newQueries[queryKey]) {
                newQueries[queryKey] = {
                  ...newQueries[queryKey],
                }
              }
              delete newQueries[queryKey][cacheKey]
            }
          } else if (queryStates !== EMPTY_OBJECT) {
            newQueries ??= {...state.queries}
            newQueries[queryKey] = EMPTY_OBJECT
          }
        }

        return newQueries === undefined
          ? state
          : {
              ...state,
              queries: newQueries,
            }
      }
      case actions.clearMutationState.type: {
        const {mutationKeys} = action as ReturnType<typeof actions.clearMutationState>

        if (mutationKeys.length === 0) {
          return state
        }

        let newMutations = undefined

        for (const mutation of mutationKeys) {
          if (state.mutations[mutation]) {
            newMutations ??= {...state.mutations}
            delete newMutations[mutation]
          }
        }

        return newMutations === undefined
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
