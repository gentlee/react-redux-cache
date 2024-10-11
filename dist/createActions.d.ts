import type { EntityChanges, Key, MutationState, QueryState, Typenames } from './types';
export type ActionMap<N extends string, T extends Typenames, QP, QR, MP, MR> = ReturnType<typeof createActions<N, T, QP, QR, MP, MR>>;
export declare const createActions: <N extends string, T extends Typenames, QP, QR, MP, MR>(name: N) => {
    /** Updates query state, and optionally merges entity changes in a single action. */
    updateQueryStateAndEntities: {
        <K extends keyof (QP | QR)>(queryKey: K, queryCacheKey: Key, state?: Partial<QueryState<QP[K], QR[K]>>, entityChanges?: EntityChanges<T>): {
            type: `@rrc/${N}/updateQueryStateAndEntities`;
            queryKey: K;
            queryCacheKey: Key;
            state: Partial<QueryState<QP[K], QR[K]>> | undefined;
            entityChanges: EntityChanges<T> | undefined;
        };
        type: `@rrc/${N}/updateQueryStateAndEntities`;
    };
    /** Updates mutation state, and optionally merges entity changes in a single action. */
    updateMutationStateAndEntities: {
        <K extends keyof (MP | MR)>(mutationKey: K, state?: Partial<MutationState<MP[K], MR[K]>>, entityChanges?: EntityChanges<T>): {
            type: `@rrc/${N}/updateMutationStateAndEntities`;
            mutationKey: K;
            state: Partial<MutationState<MP[K], MR[K]>> | undefined;
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
    /** Invalidates query states. */
    invalidateQuery: {
        <K extends keyof (QP | QR)>(queries: {
            /** Query key */
            query: K;
            /** Query cache key */
            cacheKey?: Key;
            /** Unix timestamp at which query expires. Is set to the query state. @default Date.now() */
            expiresAt?: number;
        }[]): {
            type: `@rrc/${N}/invalidateQuery`;
            queries: {
                /** Query key */
                query: K;
                /** Query cache key */
                cacheKey?: Key;
                /** Unix timestamp at which query expires. Is set to the query state. @default Date.now() */
                expiresAt?: number;
            }[];
        };
        type: `@rrc/${N}/invalidateQuery`;
    };
    /** Clear states for provided query keys and cache keys.
     * If cache key for query key is not provided, the whole state for query key is cleared. */
    clearQueryState: {
        <K extends keyof (QP | QR)>(queries: {
            /** Query key */
            query: K;
            /** Query cache key */
            cacheKey?: Key;
        }[]): {
            type: `@rrc/${N}/clearQueryState`;
            queries: {
                /** Query key */
                query: K;
                /** Query cache key */
                cacheKey?: Key;
            }[];
        };
        type: `@rrc/${N}/clearQueryState`;
    };
    /** Clear states for provided mutation keys. */
    clearMutationState: {
        <K extends keyof (MP | MR)>(mutationKeys: K[]): {
            type: `@rrc/${N}/clearMutationState`;
            mutationKeys: K[];
        };
        type: `@rrc/${N}/clearMutationState`;
    };
};
