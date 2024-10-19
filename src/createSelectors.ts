import {Cache, Key, MutationState, QueryState, Typenames} from './types'
import {EMPTY_OBJECT} from './utilsAndConstants'

export type Selectors<
  N extends string = string,
  T extends Typenames = Typenames,
  QP = unknown,
  QR = unknown,
  MP = unknown,
  MR = unknown
> = ReturnType<typeof createSelectors<N, T, QP, QR, MP, MR>>

export const createSelectors = <N extends string, T extends Typenames, QP, QR, MP, MR>(
  cache: Cache<N, T, QP, QR, MP, MR>
) => {
  const selectEntityById = <TN extends keyof T>(state: unknown, id: Key | null | undefined, typename: TN) => {
    return id == null ? undefined : cache.cacheStateSelector(state).entities[typename]?.[id]
  }

  const selectQueryState = <QK extends keyof (QP & QR)>(
    state: unknown,
    query: QK,
    cacheKey: Key
  ): QueryState<QK extends keyof (QP | QR) ? QP[QK] : never, QK extends keyof (QP | QR) ? QR[QK] : never> => {
    // @ts-expect-error fix later
    return cache.cacheStateSelector(state).queries[query][cacheKey] ?? EMPTY_OBJECT
  }

  const selectMutationState = <MK extends keyof (MP & MR)>(
    state: unknown,
    mutation: MK
  ): MutationState<
    MK extends keyof (MP | MR) ? MP[MK] : never,
    MK extends keyof (MP | MR) ? MR[MK] : never
  > => {
    // @ts-expect-error fix later
    return cache.cacheStateSelector(state).mutations[mutation] ?? EMPTY_OBJECT
  }

  return {
    selectQueryState,
    selectQueryResult: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
      return selectQueryState(state, query, cacheKey).result
    },
    selectQueryLoading: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
      return selectQueryState(state, query, cacheKey).loading ?? false
    },
    selectQueryError: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
      return selectQueryState(state, query, cacheKey).error
    },
    selectQueryParams: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
      return selectQueryState(state, query, cacheKey).params
    },
    selectQueryExpiresAt: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
      return selectQueryState(state, query, cacheKey).expiresAt
    },
    selectMutationState,
    selectMutationResult: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => {
      return selectMutationState(state, mutation).result
    },
    selectMutationLoading: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => {
      return selectMutationState(state, mutation).loading ?? false
    },
    selectMutationError: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => {
      return selectMutationState(state, mutation).error
    },
    selectMutationParams: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => {
      return selectMutationState(state, mutation).params
    },
    selectEntityById,
    selectEntities: (state: unknown) => {
      return cache.cacheStateSelector(state).entities
    },
    selectEntitiesByTypename: <TN extends keyof T>(state: unknown, typename: TN) => {
      return cache.cacheStateSelector(state).entities[typename]
    },
  }
}
