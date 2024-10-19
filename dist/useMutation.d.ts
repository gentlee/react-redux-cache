import { Store } from 'redux';
import { Actions } from './createActions';
import { Selectors } from './createSelectors';
import { Cache, Key, MutateOptions, MutationState, Typenames } from './types';
export declare const useMutation: <N extends string, T extends Typenames, QP, QR, MP, MR, MK extends keyof (MP & MR)>(cache: Cache<N, T, QP, QR, MP, MR>, actions: Actions<N, T, QP, QR, MP, MR>, selectors: Selectors<N, T, QP, QR, MP, MR>, options: Omit<MutateOptions<N, T, QP, QR, MP, MR, MK>, "params">, abortControllers: WeakMap<Store, Record<Key, AbortController>>) => readonly [(params: MK extends keyof MP & keyof MR ? MP[MK] : never) => Promise<import("./types").MutationResult<MK extends infer T_1 ? T_1 extends MK ? T_1 extends keyof MP & keyof MR ? MR[T_1] : never : never : never>>, MutationState<MK extends keyof MP & keyof MR ? MP[MK] : never, MK extends keyof MP & keyof MR ? MP[MK] : never>, () => boolean];
