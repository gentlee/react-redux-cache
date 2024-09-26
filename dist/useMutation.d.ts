import { Store } from 'redux';
import { ActionMap } from './createActions';
import { Cache, Key, MutationState, Typenames } from './types';
export declare const useMutation: <N extends string, T extends Typenames, MP, MR, MK extends keyof MP | keyof MR>(cache: Cache<N, T, unknown, unknown, MP, MR>, actions: Pick<ActionMap<N, T, unknown, unknown, MP, MR>, "updateMutationStateAndEntities">, options: {
    mutation: MK;
}, abortControllers: WeakMap<Store, Record<Key, AbortController>>) => readonly [(params: MK extends keyof MP & keyof MR ? MP[MK] : never) => Promise<import("./types").MutationResult<MK extends infer T_1 ? T_1 extends MK ? T_1 extends keyof MP & keyof MR ? MR[T_1] : never : never : never>>, MutationState<MK extends keyof MP & keyof MR ? MP[MK] : never, MK extends keyof MP & keyof MR ? MP[MK] : never>, () => boolean];
