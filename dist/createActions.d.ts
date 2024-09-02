import type { EntityChanges, Key, QueryMutationState, Typenames } from './types';
export type ActionMap<N extends string, T extends Typenames, QR, MR> = ReturnType<typeof createActions<N, T, QR, MR>>;
export declare const createActions: <N extends string, T extends Typenames, QR, MR>(name: N) => {
    updateQueryStateAndEntities: {
        <K extends keyof QR>(queryKey: K, queryCacheKey: Key, state?: Partial<QueryMutationState<QR[K]>> | undefined, entityChagnes?: EntityChanges<T> | undefined): {
            type: `@rrc/${N}/updateQueryStateAndEntities`;
            queryKey: K;
            queryCacheKey: Key;
            state: Partial<QueryMutationState<QR[K]>> | undefined;
            entityChagnes: EntityChanges<T> | undefined;
        };
        type: `@rrc/${N}/updateQueryStateAndEntities`;
    };
    updateMutationStateAndEntities: {
        <K_1 extends keyof MR>(mutationKey: K_1, state?: Partial<QueryMutationState<MR[K_1]>> | undefined, entityChagnes?: EntityChanges<T> | undefined): {
            type: `@rrc/${N}/updateMutationStateAndEntities`;
            mutationKey: K_1;
            state: Partial<QueryMutationState<MR[K_1]>> | undefined;
            entityChagnes: EntityChanges<T> | undefined;
        };
        type: `@rrc/${N}/updateMutationStateAndEntities`;
    };
    mergeEntityChanges: {
        (changes: EntityChanges<T>): {
            type: `@rrc/${N}/mergeEntityChanges`;
            changes: EntityChanges<T>;
        };
        type: `@rrc/${N}/mergeEntityChanges`;
    };
    clearQueryState: {
        <K_2 extends keyof QR>(queryKeys: {
            key: K_2;
            cacheKey?: Key | undefined;
        }[]): {
            type: `@rrc/${N}/clearQueryState`;
            queryKeys: {
                key: K_2;
                cacheKey?: Key | undefined;
            }[];
        };
        type: `@rrc/${N}/clearQueryState`;
    };
    clearMutationState: {
        <K_3 extends keyof MR>(mutationKeys: K_3[]): {
            type: `@rrc/${N}/clearMutationState`;
            mutationKeys: K_3[];
        };
        type: `@rrc/${N}/clearMutationState`;
    };
};
