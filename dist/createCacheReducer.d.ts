import type { ActionMap } from './createActions';
import type { CacheOptions, Dict, EntitiesMap, MutationState, QueryState, Typenames } from './types';
export type ReduxCacheState<T extends Typenames, QP, QR, MP, MR> = ReturnType<ReturnType<typeof createCacheReducer<string, T, QP, QR, MP, MR>>>;
export declare const createCacheReducer: <N extends string, T extends Typenames, QP, QR, MP, MR>(actions: ActionMap<N, T, QP, QR, MP, MR>, typenames: T, queryKeys: (keyof QP & keyof QR)[], cacheOptions: CacheOptions) => (state: {
    entities: EntitiesMap<T>;
    queries: QP | QR extends infer T_1 ? { [QK in keyof T_1]: Dict<QueryState<QP[QK], QR[QK]> | undefined>; } : never;
    mutations: MP | MR extends infer T_2 ? { [MK in keyof T_2]: MutationState<MP[MK], MR[MK]>; } : never;
} | undefined, action: {
    type: `@rrc/${N}/updateQueryStateAndEntities`;
    queryKey: keyof QP & keyof QR;
    queryCacheKey: import("./types").Key;
    state: Partial<QueryState<QP[keyof QP & keyof QR], QR[keyof QP & keyof QR]>> | undefined;
    entityChanges: import("./types").EntityChanges<T> | undefined;
} | {
    type: `@rrc/${N}/updateMutationStateAndEntities`;
    mutationKey: keyof MP & keyof MR;
    state: Partial<MutationState<MP[keyof MP & keyof MR], MR[keyof MP & keyof MR]>> | undefined;
    entityChanges: import("./types").EntityChanges<T> | undefined;
} | {
    type: `@rrc/${N}/mergeEntityChanges`;
    changes: import("./types").EntityChanges<T>;
} | {
    type: `@rrc/${N}/invalidateQuery`;
    queries: {
        key: keyof QP & keyof QR;
        cacheKey?: import("./types").Key | undefined;
        expiresAt?: number | undefined;
    }[];
} | {
    type: `@rrc/${N}/clearQueryState`;
    queries: {
        key: keyof QP & keyof QR;
        cacheKey?: import("./types").Key | undefined;
    }[];
} | {
    type: `@rrc/${N}/clearMutationState`;
    mutationKeys: (keyof MP & keyof MR)[];
}) => {
    entities: EntitiesMap<T>;
    queries: QP | QR extends infer T_1 ? { [QK in keyof T_1]: Dict<QueryState<QP[QK], QR[QK]> | undefined>; } : never;
    mutations: MP | MR extends infer T_2 ? { [MK in keyof T_2]: MutationState<MP[MK], MR[MK]>; } : never;
};
