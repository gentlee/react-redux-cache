import {CachePrivate} from '../private-types'
import {QueryOptions, QueryState, Typenames, UseQueryOptions} from '../types'

export declare const useQuery: <
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  QK extends keyof (QP & QR),
>(
  cache: Pick<CachePrivate<N, T, QP, QR, MP, MR>, 'storeHooks' | 'config' | 'actions' | 'selectors'>,
  useQueryOptions: UseQueryOptions<T, QK, QP, QR>,
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
    options?: Partial<Pick<QueryOptions<T, QP, QR, QK>, 'params' | 'onlyIfExpired'>>,
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
