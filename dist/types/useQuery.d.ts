import {Actions} from './createActions'
import {Selectors} from './createSelectors'
import {Cache, QueryOptions, QueryState, Typenames, UseQueryOptions} from './types'

export declare const useQuery: <
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  QK extends keyof (QP & QR)
>(
  cache: Pick<Cache<N, T, QP, QR, MP, MR>, 'options' | 'globals' | 'queries' | 'storeHooks'>,
  actions: Actions<N, T, QP, QR, MP, MR>,
  selectors: Selectors<N, T, QP, QR, MP, MR>,
  options: UseQueryOptions<N, T, QK, QP, QR, MP, MR>
) => readonly [
  Omit<
    QueryState<
      T,
      QK extends keyof QP & keyof QR ? QP[QK] : never,
      QK extends keyof QP & keyof QR ? QR[QK] : never
    >,
    'expiresAt'
  >,
  (
    options?: Partial<Pick<QueryOptions<N, T, QP, QR, QK, MP, MR>, 'params' | 'onlyIfExpired'>>
  ) => Promise<
    import('./types').QueryResult<
      QK extends infer T_1
        ? T_1 extends QK
          ? T_1 extends keyof QP & keyof QR
            ? QR[T_1]
            : never
          : never
        : never
    >
  >
]
