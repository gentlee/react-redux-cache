import {Actions} from './createActions'
import {createReducer} from './createReducer'
import {StoreHooks} from './react'
import {AnyStore, Cache, Key, ReduxStoreLike, Typenames, ZustandStoreLike} from './types'

/** Inner logic works with Redux-like stores. */
export type InnerStore<S = unknown> = ReduxStoreLike<S>

export type CachePrivate<
  N extends string = string,
  T extends Typenames = Typenames,
  QP = unknown,
  QR = unknown,
  MP = unknown,
  MR = unknown,
> = Cache<N, T, QP, QR, MP, MR> & {
  actions: Actions<N, T, QP, QR, MP, MR>
  reducer: ReturnType<typeof createReducer<N, T, QP, QR, MP, MR>>
  abortControllers: WeakMap<InnerStore, Record<Key, AbortController>>
  extensions?: CacheExtensions
}

export type CacheExtensions = {
  zustand?: {
    innerStore: InnerStore
    externalStore: ZustandStoreLike
  }
  react?: {
    storeHooks: StoreHooksPrivate
  }
}

export type StoreHooksPrivate = StoreHooks & {
  useExternalStore: () => AnyStore
}

export type CacheToPrivate<C> =
  C extends Cache<infer N, infer T, infer QP, infer QR, infer MP, infer MR>
    ? CachePrivate<N, T, QP, QR, MP, MR>
    : never
