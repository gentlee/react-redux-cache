import { Store } from 'redux';
import { ActionMap } from './createActions';
import { Cache, Key, QueryMutationState, Typenames } from './types';
export declare const useMutation: <N extends string, T extends Typenames, MP, MR, MK extends keyof MP | keyof MR>(cache: Cache<N, T, unknown, unknown, MP, MR>, actions: Pick<ActionMap<N, T, unknown, MR>, "updateMutationStateAndEntities">, options: {
    mutation: MK;
}, abortControllers: WeakMap<Store, Record<Key, AbortController>>) => readonly [(params: MK extends keyof MP & keyof MR ? MP[MK] : never) => Promise<void>, QueryMutationState<MK extends keyof MP & keyof MR ? MP[MK] : never>, () => boolean];
