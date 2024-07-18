import { clearMutationState, clearQueryState, mergeEntityChanges, updateMutationStateAndEntities, updateQueryStateAndEntities } from './actions';
import type { Cache, Dict, EntitiesMap, QueryMutationState, Typenames } from './types';
export type ReduxCacheState<T extends Typenames, QP, QR, MP, MR> = ReturnType<ReturnType<typeof createCacheReducer<T, QP, QR, MP, MR>>>;
export declare const createCacheReducer: <T extends Typenames, QP, QR, MP, MR>(typenames: T, queries: QP & QR extends infer T_1 ? { [QK in keyof T_1]: QK extends keyof QP & keyof QR ? import("./types").QueryInfo<T, QP[QK], QR[QK], {
    entities: EntitiesMap<T>;
    queries: { [QK_1 in keyof QR]: Dict<QueryMutationState<QR[QK_1]>>; };
    mutations: { [MK in keyof MR]: QueryMutationState<MR[MK]>; };
}> : never; } : never, mutations: MP & MR extends infer T_2 ? { [MK_1 in keyof T_2]: MK_1 extends keyof MP & keyof MR ? import("./types").MutationInfo<T, MP[MK_1], MR[MK_1]> : never; } : never, cacheOptions: import("./types").CacheOptions) => (state: {
    entities: EntitiesMap<T>;
    queries: { [QK_1 in keyof QR]: Dict<QueryMutationState<QR[QK_1]>>; };
    mutations: { [MK in keyof MR]: QueryMutationState<MR[MK]>; };
} | undefined, action: {
    type: `${string}UPDATE_QUERY_STATE_AND_ENTITIES`;
    queryKey: keyof QR;
    queryCacheKey: import("./types").Key;
    state: Partial<QueryMutationState<QR[keyof QR]>> | undefined;
    entityChagnes: import("./types").EntityChanges<T> | undefined;
} | {
    type: `${string}UPDATE_MUTATION_STATE_AND_ENTITIES`;
    mutationKey: keyof MR;
    state: Partial<QueryMutationState<MR[keyof MR]>> | undefined;
    entityChagnes: import("./types").EntityChanges<T> | undefined;
} | {
    type: `${string}MERGE_ENTITY_CHANGES`;
    changes: import("./types").EntityChanges<T>;
} | {
    type: `${string}CLEAR_QUERY_STATE`;
    queryKeys: {
        key: keyof QR;
        cacheKey?: import("./types").Key | undefined;
    }[];
} | {
    type: `${string}CLEAR_MUTATION_STATE`;
    mutationKeys: (keyof MR)[];
}) => {
    entities: EntitiesMap<T>;
    queries: { [QK_1 in keyof QR]: Dict<QueryMutationState<QR[QK_1]>>; };
    mutations: { [MK in keyof MR]: QueryMutationState<MR[MK]>; };
};
