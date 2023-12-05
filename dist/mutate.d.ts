import { Store } from 'redux';
import { Cache, Key, MutationCacheOptions, MutationResult, Typenames } from './types';
export declare const abortControllers: WeakMap<Store<any, import("redux").AnyAction>, Record<Key, AbortController>>;
export declare const getAbortController: (store: Store, mutationKey: Key) => AbortController | undefined;
export declare const mutate: <T extends Typenames, QP, QR, MP, MR, MK extends keyof MP | keyof MR>(logTag: string, returnResult: boolean, store: Store, cache: Cache<T, QP, QR, MP, MR>, mutationKey: MK, cacheOptions: MutationCacheOptions, params: MK extends keyof MP & keyof MR ? MP[MK] : never) => Promise<void | MutationResult<MK extends keyof MP & keyof MR ? MR[MK] : never>>;
