import {CachePrivate, InnerStore} from './private-types'
import type {AnyStore, MutationResult, Typenames} from './types'

export declare const mutate: <
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  MK extends keyof (MP & MR),
>(
  logTag: string,
  innerStore: InnerStore,
  externalStore: AnyStore,
  {
    config: {mutations, options, globals},
    actions: {updateMutationStateAndEntities},
    abortControllers,
  }: Pick<CachePrivate<N, T, QP, QR, MP, MR>, 'config' | 'actions' | 'abortControllers'>,
  mutationKey: MK,
  params: MK extends keyof (MP | MR) ? MP[MK] : never,
  onCompleted?:
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & string]> | undefined,
        error: unknown | undefined,
        params: MP[keyof MP & keyof MR & string] | undefined,
        store: AnyStore,
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & number]> | undefined,
        error: unknown | undefined,
        params: MP[keyof MP & keyof MR & number] | undefined,
        store: AnyStore,
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & symbol]> | undefined,
        error: unknown | undefined,
        params: MP[keyof MP & keyof MR & symbol] | undefined,
        store: AnyStore,
      ) => void)
    | undefined,
  onSuccess?:
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & string]>,
        params: MP[keyof MP & keyof MR & string] | undefined,
        store: AnyStore,
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & number]>,
        params: MP[keyof MP & keyof MR & number] | undefined,
        store: AnyStore,
      ) => void)
    | ((
        response: import('./types').NormalizedQueryResponse<T, MR[keyof MP & keyof MR & symbol]>,
        params: MP[keyof MP & keyof MR & symbol] | undefined,
        store: AnyStore,
      ) => void)
    | undefined,
  onError?:
    | ((
        error: unknown,
        params: MP[keyof MP & keyof MR & string] | undefined,
        store: AnyStore,
      ) => boolean | void | null | undefined)
    | ((
        error: unknown,
        params: MP[keyof MP & keyof MR & number] | undefined,
        store: AnyStore,
      ) => boolean | void | null | undefined)
    | ((
        error: unknown,
        params: MP[keyof MP & keyof MR & symbol] | undefined,
        store: AnyStore,
      ) => boolean | void | null | undefined)
    | undefined,
) => Promise<MutationResult<MK extends keyof (MP | MR) ? MR[MK] : never>>
