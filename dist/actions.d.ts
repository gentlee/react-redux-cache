import type { EntityChanges, Key, QueryMutationState, Typenames } from './types';
export declare const updateQueryStateAndEntities: <T extends Typenames, QR, K extends keyof QR>(queryKey: K, queryCacheKey: Key, state?: Partial<QueryMutationState<QR[K]>> | undefined, entityChagnes?: EntityChanges<T> | undefined) => {
    type: `${string}UPDATE_QUERY_STATE_AND_ENTITIES`;
    queryKey: K;
    queryCacheKey: Key;
    state: Partial<QueryMutationState<QR[K]>> | undefined;
    entityChagnes: EntityChanges<T> | undefined;
};
export declare const updateMutationStateAndEntities: <T extends Typenames, MR, K extends keyof MR>(mutationKey: K, state?: Partial<QueryMutationState<MR[K]>> | undefined, entityChagnes?: EntityChanges<T> | undefined) => {
    type: `${string}UPDATE_MUTATION_STATE_AND_ENTITIES`;
    mutationKey: K;
    state: Partial<QueryMutationState<MR[K]>> | undefined;
    entityChagnes: EntityChanges<T> | undefined;
};
export declare const mergeEntityChanges: <T extends Typenames>(changes: EntityChanges<T>) => {
    type: `${string}MERGE_ENTITY_CHANGES`;
    changes: EntityChanges<T>;
};
export declare const clearQueryState: <QR, K extends keyof QR>(queryKeys: {
    key: K;
    cacheKey?: Key | undefined;
}[]) => {
    type: `${string}CLEAR_QUERY_STATE`;
    queryKeys: {
        key: K;
        cacheKey?: Key | undefined;
    }[];
};
export declare const clearMutationState: <MR, K extends keyof MR>(mutationKeys: K[]) => {
    type: `${string}CLEAR_MUTATION_STATE`;
    mutationKeys: K[];
};
