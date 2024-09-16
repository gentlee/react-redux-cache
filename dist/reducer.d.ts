import type { ActionMap } from './createActions';
import type { CacheOptions, Dict, EntitiesMap, QueryMutationState, Typenames } from './types';
export type ReduxCacheState<T extends Typenames, QP, QR, MP, MR> = ReturnType<ReturnType<typeof createCacheReducer<string, T, QP, QR, MP, MR>>>;
export declare const createCacheReducer: <N extends string, T extends Typenames, QP, QR, MP, MR>(actions: ActionMap<N, T, QP, QR, MP, MR>, typenames: T, queryKeys: (keyof QP & keyof QR)[], cacheOptions: CacheOptions) => (state: {
    entities: EntitiesMap<T>;
    queries: QP | QR extends infer T_1 ? { [QK in keyof T_1]: Dict<QueryMutationState<QP[QK], QR[QK]>>; } : never;
    mutations: MP | MR extends infer T_2 ? { [MK in keyof T_2]: QueryMutationState<MP[MK], MR[MK]>; } : never;
} | undefined, action: {
    type: `@rrc/${N}/updateQueryStateAndEntities`;
    queryKey: keyof QP & keyof QR;
    queryCacheKey: import("./types").Key;
    state: Partial<QueryMutationState<QP[keyof QP & keyof QR], QR[keyof QP & keyof QR]>> | undefined;
    entityChanges: import("./types").EntityChanges<T> | undefined;
} | {
    type: `@rrc/${N}/updateMutationStateAndEntities`;
    mutationKey: keyof MP & keyof MR;
    state: Partial<QueryMutationState<MP[keyof MP & keyof MR], MR[keyof MP & keyof MR]>> | undefined;
    entityChanges: import("./types").EntityChanges<T> | undefined;
} | {
    type: `@rrc/${N}/mergeEntityChanges`;
    changes: import("./types").EntityChanges<T>;
} | {
    type: `@rrc/${N}/clearQueryState`;
    queryKeys: {
        key: keyof QP & keyof QR;
        cacheKey?: import("./types").Key | undefined;
    }[];
} | {
    type: `@rrc/${N}/clearMutationState`;
    mutationKeys: (keyof MP & keyof MR)[];
}) => {
    entities: EntitiesMap<T>;
    queries: QP | QR extends infer T_1 ? { [QK in keyof T_1]: Dict<QueryMutationState<QP[QK], QR[QK]>>; } : never;
    mutations: MP | MR extends infer T_2 ? { [MK in keyof T_2]: QueryMutationState<MP[MK], MR[MK]>; } : never;
};
