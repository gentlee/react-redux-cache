import type { EntityChanges, Key, MutationState, QueryState, Typenames } from './types';
import { ReduxCacheState } from './types';
export type Actions<N extends string = string, T extends Typenames = Typenames, QP = unknown, QR = unknown, MP = unknown, MR = unknown> = ReturnType<typeof createActions<N, T, QP, QR, MP, MR>>;
export declare const createActions: <N extends string, T extends Typenames, QP, QR, MP, MR>(name: N) => {
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
    updateMutationStateAndEntities: {
        <K extends keyof (MP | MR)>(mutationKey: K, state?: Partial<MutationState<MP[K], MR[K]>>, entityChanges?: EntityChanges<T>): {
            type: `@rrc/${N}/updateMutationStateAndEntities`;
            mutationKey: K;
            state: Partial<MutationState<MP[K], MR[K]>> | undefined;
            entityChanges: EntityChanges<T> | undefined;
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
    invalidateQuery: {
        <K extends keyof (QP | QR)>(queries: {
            /** Query key */
            query: K;
            /** Query cache key */
            cacheKey?: Key;
            /** Unix timestamp at which query expires. Is set to the query state. @Default Date.now() */
            expiresAt?: number;
        }[]): {
            type: `@rrc/${N}/invalidateQuery`;
            queries: {
                /** Query key */
                query: K;
                /** Query cache key */
                cacheKey?: Key;
                /** Unix timestamp at which query expires. Is set to the query state. @Default Date.now() */
                expiresAt?: number;
            }[];
        };
        type: `@rrc/${N}/invalidateQuery`;
    };
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
    clearMutationState: {
        <K extends keyof (MP | MR)>(mutationKeys: K[]): {
            type: `@rrc/${N}/clearMutationState`;
            mutationKeys: K[];
        };
        type: `@rrc/${N}/clearMutationState`;
    };
    clearCache: {
        (stateToKeep?: Partial<ReduxCacheState<T, QP, QR, MP, MR>>): {
            type: `@rrc/${N}/clearCache`;
            stateToKeep: Partial<ReduxCacheState<T, QP, QR, MP, MR>> | undefined;
        };
        type: `@rrc/${N}/clearCache`;
    };
};
