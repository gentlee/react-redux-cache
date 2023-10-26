import { Cache, Dict, EntitiesMap, EntityChanges, Key, QueryMutationState, Typenames } from './types';
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
    type: `${string}SET_QUERY_STATE_AND_ENTITIES`;
    queryKey: keyof QR;
    queryCacheKey: Key;
    state: Partial<QueryMutationState<QR[keyof QR]>> | undefined;
    entityChagnes: EntityChanges<T> | undefined;
} | {
    type: `${string}SET_MUTATION_STATE_AND_ENTITIES`;
    mutationKey: keyof MR;
    state: Partial<QueryMutationState<MR[keyof MR]>> | undefined;
    entityChagnes: EntityChanges<T> | undefined;
} | {
    type: `${string}MERGE_ENTITY_CHANGES`;
    changes: EntityChanges<T>;
}) => {
    entities: EntitiesMap<T>;
    queries: { [QK_1 in keyof QR]: Dict<QueryMutationState<QR[QK_1]>>; };
    mutations: { [MK in keyof MR]: QueryMutationState<MR[MK]>; };
};
export declare const setQueryStateAndEntities: <T extends Typenames, QR, K extends keyof QR>(queryKey: K, queryCacheKey: Key, state?: Partial<QueryMutationState<QR[K]>> | undefined, entityChagnes?: EntityChanges<T> | undefined) => {
    type: `${string}SET_QUERY_STATE_AND_ENTITIES`;
    queryKey: K;
    queryCacheKey: Key;
    state: Partial<QueryMutationState<QR[K]>> | undefined;
    entityChagnes: EntityChanges<T> | undefined;
};
export declare const setMutationStateAndEntities: <T extends Typenames, MR, K extends keyof MR>(mutationKey: K, state?: Partial<QueryMutationState<MR[K]>> | undefined, entityChagnes?: EntityChanges<T> | undefined) => {
    type: `${string}SET_MUTATION_STATE_AND_ENTITIES`;
    mutationKey: K;
    state: Partial<QueryMutationState<MR[K]>> | undefined;
    entityChagnes: EntityChanges<T> | undefined;
};
export declare const mergeEntityChanges: <T extends Typenames>(changes: EntityChanges<T>) => {
    type: `${string}MERGE_ENTITY_CHANGES`;
    changes: EntityChanges<T>;
};
