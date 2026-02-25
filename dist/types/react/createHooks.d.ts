import {Cache, Key, Typenames} from '../types'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'

export declare const createHooks: <N extends string, T extends Typenames, QP, QR, MP, MR>(
  cache: Cache<N, T, QP, QR, MP, MR>,
) => {
  /** Returns memoized object with query and mutate functions. Memoization dependency is the store. */
  useClient: () => {
    query: <QK extends keyof QP | keyof QR>(
      options: import('../types').QueryOptions<T, QP, QR, QK>,
    ) => Promise<import('../types').QueryResult<QK extends keyof QP & keyof QR ? QR[QK] : never>>
    mutate: <MK extends keyof MP | keyof MR>(
      options: import('../types').MutateOptions<T, MP, MR, MK>,
    ) => Promise<import('../types').MutationResult<MK extends keyof MP & keyof MR ? MR[MK] : never>>
  }
  /** Fetches query when params change and subscribes to query state changes (subscription depends on `selectorComparer`). */
  useQuery: <QK extends keyof (QP & QR)>(
    options: Parameters<typeof useQuery<N, T, QP, QR, MP, MR, QK>>[1],
  ) => readonly [
    Omit<
      import('../types').QueryState<
        T,
        QK extends keyof QP & keyof QR ? QP[QK] : never,
        QK extends keyof QP & keyof QR ? QR[QK] : never
      >,
      'expiresAt'
    >,
    (
      options?:
        | Partial<Pick<import('../types').QueryOptions<T, QP, QR, QK>, 'params' | 'onlyIfExpired'>>
        | undefined,
    ) => Promise<
      import('../types').QueryResult<
        QK extends infer T_1
          ? T_1 extends QK
            ? T_1 extends keyof QP & keyof QR
              ? QR[T_1]
              : never
            : never
          : never
      >
    >,
  ]
  /** Subscribes to provided mutation state and provides mutate function. */
  useMutation: <MK extends keyof (MP & MR)>(
    options: Parameters<typeof useMutation<N, T, QP, QR, MP, MR, MK>>[1],
  ) => readonly [
    (
      params: MK extends keyof MP & keyof MR ? MP[MK] : never,
    ) => Promise<
      import('../types').MutationResult<
        MK extends infer T_1
          ? T_1 extends MK
            ? T_1 extends keyof MP & keyof MR
              ? MR[T_1]
              : never
            : never
          : never
      >
    >,
    import('../types').MutationState<
      T,
      MK extends keyof MP & keyof MR ? MP[MK] : never,
      MK extends keyof MP & keyof MR ? MP[MK] : never
    >,
    () => boolean,
  ]
  /** useSelector + selectEntityById. */
  useSelectEntityById: <TN extends keyof T>(id: Key | null | undefined, typename: TN) => T[TN] | undefined
  /**
   * useSelector + selectEntitiesByTypename. Also subscribes to collection's change key if `mutableCollections` enabled.
   * @warning Subscribing to collections should be avoided.
   * */
  useEntitiesByTypename: <TN extends keyof T>(
    typename: TN,
  ) => (import('../types').EntitiesMap<T> & import('../types').Mutable)[TN]
}
