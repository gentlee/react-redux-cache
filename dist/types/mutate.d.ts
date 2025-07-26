import type {Actions} from './createActions'
import {Selectors} from './createSelectors'
import type {Cache, Key, MutationResult, Store, Typenames} from './types'

export declare const mutate: <
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  MK extends keyof (MP & MR)
>(
  logTag: string,
  store: Store,
  cache: Pick<Cache<N, T, QP, QR, MP, MR>, 'options' | 'globals' | 'mutations'>,
  actions: Actions<N, T, QP, QR, MP, MR>,
  selectors: Selectors<N, T, QP, QR, MP, MR>,
  mutationKey: MK,
  params: MK extends keyof (MP | MR) ? MP[MK] : never,
  abortControllers: WeakMap<Store, Record<Key, AbortController>>,
  onCompleted?:
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & string]> | undefined,
        error: unknown | undefined,
        params: MP[keyof MP & keyof MR & string] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & number]> | undefined,
        error: unknown | undefined,
        params: MP[keyof MP & keyof MR & number] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & symbol]> | undefined,
        error: unknown | undefined,
        params: MP[keyof MP & keyof MR & symbol] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | undefined,
  onSuccess?:
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & string]>,
        params: MP[keyof MP & keyof MR & string] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & number]>,
        params: MP[keyof MP & keyof MR & number] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & symbol]>,
        params: MP[keyof MP & keyof MR & symbol] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => void)
    | undefined,
  onError?:
    | ((
        error: unknown,
        params: MP[keyof MP & keyof MR & string] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => boolean | void | null | undefined)
    | ((
        error: unknown,
        params: MP[keyof MP & keyof MR & number] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => boolean | void | null | undefined)
    | ((
        error: unknown,
        params: MP[keyof MP & keyof MR & symbol] | undefined,
        store: Store,
        actions: Actions<N, T, QP, QR, MP, MR>,
        selectors: Selectors<N, T, QP, QR, MP, MR>
      ) => boolean | void | null | undefined)
    | undefined
) => Promise<MutationResult<MK extends keyof (MP | MR) ? MR[MK] : never>>
