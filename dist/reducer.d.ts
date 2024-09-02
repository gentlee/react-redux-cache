import type { ActionMap } from './createActions';
import type { CacheOptions, Dict, EntitiesMap, QueryMutationState, Typenames } from './types';
export type ReduxCacheState<T extends Typenames, QR, MR> = ReturnType<ReturnType<typeof createCacheReducer<string, T, QR, MR>>>;
export declare const createCacheReducer: <N extends string, T extends Typenames, QR, MR>(actions: ActionMap<N, T, QR, MR>, typenames: T, queryKeys: (keyof QR)[], cacheOptions: CacheOptions) => (state: {
    entities: EntitiesMap<T>;
    queries: { [QK in keyof QR]: Dict<QueryMutationState<QR[QK]>>; };
    mutations: { [MK in keyof MR]: QueryMutationState<MR[MK]>; };
} | undefined, action: {
    type: `@rrc/${N}/updateQueryStateAndEntities`;
    queryKey: keyof QR;
    queryCacheKey: import("./types").Key;
    state: Partial<QueryMutationState<QR[keyof QR]>> | undefined;
    entityChagnes: import("./types").EntityChanges<T> | undefined;
} | {
    type: `@rrc/${N}/updateMutationStateAndEntities`;
    mutationKey: keyof MR;
    state: Partial<QueryMutationState<MR[keyof MR]>> | undefined;
    entityChagnes: import("./types").EntityChanges<T> | undefined;
} | {
    type: `@rrc/${N}/mergeEntityChanges`;
    changes: import("./types").EntityChanges<T>;
} | {
    type: `@rrc/${N}/clearQueryState`;
    queryKeys: {
        key: keyof QR;
        cacheKey?: import("./types").Key | undefined;
    }[];
} | {
    type: `@rrc/${N}/clearMutationState`;
    mutationKeys: (keyof MR)[];
}) => {
    entities: EntitiesMap<T>;
    queries: { [QK in keyof QR]: Dict<QueryMutationState<QR[QK]>>; };
    mutations: { [MK in keyof MR]: QueryMutationState<MR[MK]>; };
};
