import type { ActionMap } from './createActions';
import type { CacheOptions, Dict, EntitiesMap, MutationState, QueryState, Typenames } from './types';
export type ReduxCacheState<T extends Typenames, QP, QR, MP, MR> = ReturnType<ReturnType<typeof createCacheReducer<string, T, QP, QR, MP, MR>>>;
export declare const createCacheReducer: <N extends string, T extends Typenames, QP, QR, MP, MR>(actions: ActionMap<N, T, QP, QR, MP, MR>, queryKeys: (keyof (QP | QR))[], cacheOptions: CacheOptions) => (state: {
    entities: EntitiesMap<T>;
    queries: { [QK in keyof (QP | QR)]: Dict<QueryState<QP[QK], QR[QK]> | undefined>; };
    mutations: { [MK in keyof (MP | MR)]: MutationState<MP[MK], MR[MK]>; };
} | undefined, action: ReturnType<(typeof actions)[keyof typeof actions]>) => {
    entities: EntitiesMap<T>;
    queries: { [QK in keyof (QP | QR)]: Dict<QueryState<QP[QK], QR[QK]> | undefined>; };
    mutations: { [MK in keyof (MP | MR)]: MutationState<MP[MK], MR[MK]>; };
};
