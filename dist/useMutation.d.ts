import { Store } from 'redux';
import { Cache, Key, QueryMutationState, Typenames } from './types';
export declare const useMutation: <T extends Typenames, MP, MR, MK extends keyof MP | keyof MR>(cache: Cache<T, unknown, unknown, MP, MR>, options: {
    mutation: MK;
}, abortControllers: WeakMap<Store, Record<Key, AbortController>>) => readonly [(params: MK extends keyof MP & keyof MR ? MP[MK] : never) => Promise<void>, QueryMutationState<MK extends keyof MP & keyof MR ? MP[MK] : never>, () => boolean];
