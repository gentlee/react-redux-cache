import type { EntityChanges, Key, QueryMutationState, Typenames } from './types';
export type ActionMap<N extends string, T extends Typenames, QP, QR, MP, MR> = ReturnType<typeof createActions<N, T, QP, QR, MP, MR>>;
export declare const createActions: <N extends string, T extends Typenames, QP, QR, MP, MR>(name: N) => {
    /** Updates query state, and optionally merges entity changes in a single action. */
    updateQueryStateAndEntities: {
        <K extends keyof QP & keyof QR>(queryKey: K, queryCacheKey: Key, state?: Partial<QueryMutationState<QP[K], QR[K]>> | undefined, entityChanges?: EntityChanges<T> | undefined): {
            type: `@rrc/${N}/updateQueryStateAndEntities`;
            queryKey: K;
            queryCacheKey: Key;
            state: Partial<QueryMutationState<QP[K], QR[K]>> | undefined;
            entityChanges: EntityChanges<T> | undefined;
        };
        type: `@rrc/${N}/updateQueryStateAndEntities`;
    };
    /** Updates mutation state, and optionally merges entity changes in a single action. */
    updateMutationStateAndEntities: {
        <K_1 extends keyof MP & keyof MR>(mutationKey: K_1, state?: Partial<QueryMutationState<MP[K_1], MR[K_1]>> | undefined, entityChanges?: EntityChanges<T> | undefined): {
            type: `@rrc/${N}/updateMutationStateAndEntities`;
            mutationKey: K_1;
            state: Partial<QueryMutationState<MP[K_1], MR[K_1]>> | undefined;
            entityChanges: EntityChanges<T> | undefined;
        };
        type: `@rrc/${N}/updateMutationStateAndEntities`;
    };
    /** Merge EntityChanges to the state. */
    mergeEntityChanges: {
        (changes: EntityChanges<T>): {
            type: `@rrc/${N}/mergeEntityChanges`;
            changes: EntityChanges<T>;
        };
        type: `@rrc/${N}/mergeEntityChanges`;
    };
    /** Clear states for provided query keys and cache keys.
     * If cache key for query key is not provided, the whole state for query key is cleared. */
    clearQueryState: {
        <K_2 extends keyof QP & keyof QR>(queryKeys: {
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
    /** Clear states for provided mutation keys. */
    clearMutationState: {
        <K_3 extends keyof MP & keyof MR>(mutationKeys: K_3[]): {
            type: `@rrc/${N}/clearMutationState`;
            mutationKeys: K_3[];
        };
        type: `@rrc/${N}/clearMutationState`;
    };
};
