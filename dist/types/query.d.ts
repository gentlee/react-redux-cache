import type {Actions} from './createActions'
import {Selectors} from './createSelectors'
import type {Cache, Key, QueryResult, Store, Typenames} from './types'

export declare const query: <
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  QK extends keyof (QP & QR)
>(
  logTag: string,
  store: Store,
  cache: Cache<N, T, QP, QR, MP, MR>,
  actions: Actions<N, T, QP, QR, MP, MR>,
  selectors: Selectors<N, T, QP, QR, MP, MR>,
  queryKey: QK,
  cacheKey: Key,
  params: QK extends keyof (QP | QR) ? QP[QK] : never,
  secondsToLive: number | undefined,
  onlyIfExpired: boolean | undefined,
  skipFetch: boolean | undefined,
  mergeResults?:
    | ((
        oldResult: QR[keyof QP & keyof QR & string] | undefined,
        response: import('./types').NormalizedQueryResponse<T, QR[keyof QP & keyof QR & string]>,
        params: QP[keyof QP & keyof QR & string] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => QR[keyof QP & keyof QR & string])
    | ((
        oldResult: QR[keyof QP & keyof QR & number] | undefined,
        response: import('./types').NormalizedQueryResponse<T, QR[keyof QP & keyof QR & number]>,
        params: QP[keyof QP & keyof QR & number] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => QR[keyof QP & keyof QR & number])
    | ((
        oldResult: QR[keyof QP & keyof QR & symbol] | undefined,
        response: import('./types').NormalizedQueryResponse<T, QR[keyof QP & keyof QR & symbol]>,
        params: QP[keyof QP & keyof QR & symbol] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => QR[keyof QP & keyof QR & symbol])
    | undefined,
  onCompleted?:
    | ((
        response: import('./types').NormalizedQueryResponse<T, QR[keyof QP & keyof QR & string]> | undefined,
        error: unknown | undefined,
        params: QP[keyof QP & keyof QR & string] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, QR[keyof QP & keyof QR & number]> | undefined,
        error: unknown | undefined,
        params: QP[keyof QP & keyof QR & number] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, QR[keyof QP & keyof QR & symbol]> | undefined,
        error: unknown | undefined,
        params: QP[keyof QP & keyof QR & symbol] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | undefined,
  onSuccess?:
    | ((
        response: import('./types').NormalizedQueryResponse<T, QR[keyof QP & keyof QR & string]>,
        params: QP[keyof QP & keyof QR & string] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, QR[keyof QP & keyof QR & number]>,
        params: QP[keyof QP & keyof QR & number] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, QR[keyof QP & keyof QR & symbol]>,
        params: QP[keyof QP & keyof QR & symbol] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | undefined,
  onError?:
    | ((
        error: unknown,
        params: QP[keyof QP & keyof QR & string] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => boolean | void | null | undefined)
    | ((
        error: unknown,
        params: QP[keyof QP & keyof QR & number] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => boolean | void | null | undefined)
    | ((
        error: unknown,
        params: QP[keyof QP & keyof QR & symbol] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => boolean | void | null | undefined)
    | undefined
) => Promise<QueryResult<QK extends keyof (QP | QR) ? QR[QK] : never>>
