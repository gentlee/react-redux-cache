import { Store } from 'redux';
import type { ActionMap } from './createActions';
import type { Cache, Key, MutationResult, Typenames } from './types';
export declare const mutate: <N extends string, T extends Typenames, QP, QR, MP, MR, MK extends keyof MP | keyof MR>(logTag: string, store: Store, cache: Cache<N, T, QP, QR, MP, MR>, { updateMutationStateAndEntities, }: Pick<ActionMap<N, T, unknown, unknown, MP, MR>, "updateMutationStateAndEntities">, mutationKey: MK, params: MK extends keyof MP & keyof MR ? MP[MK] : never, abortControllers: WeakMap<Store, Record<Key, AbortController>>) => Promise<MutationResult<MK extends keyof MP & keyof MR ? MR[MK] : never>>;
