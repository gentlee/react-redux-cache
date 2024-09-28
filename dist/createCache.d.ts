import type { Cache, Key, MutateOptions, MutationResult, MutationState, OptionalPartial, QueryOptions, QueryResult, QueryState, Typenames } from './types';
import { useMutation } from './useMutation';
import { useQuery } from './useQuery';
import { applyEntityChanges } from './utilsAndConstants';
/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
export declare const createCache: <N extends string, T extends Typenames, QP, QR, MP, MR>(partialCache: OptionalPartial<Cache<N, T, QP, QR, MP, MR>, "queries" | "options" | "mutations" | "cacheStateSelector">) => {
    /** Keeps all options, passed while creating the cache. */
    cache: Cache<N, T, QP, QR, MP, MR>;
    /** Reducer of the cache, should be added to redux store. */
    reducer: (state: {
        entities: import("./types").EntitiesMap<T>;
        queries: QP | QR extends infer T_1 ? { [QK in keyof T_1]: import("./types").Dict<QueryState<QP[QK], QR[QK]> | undefined>; } : never;
        mutations: MP | MR extends infer T_2 ? { [MK in keyof T_2]: MutationState<MP[MK], MR[MK]>; } : never;
    } | undefined, action: {
        type: `@rrc/${N}/updateQueryStateAndEntities`;
        queryKey: keyof QP & keyof QR;
        queryCacheKey: Key;
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
            query: keyof QP & keyof QR;
            cacheKey?: Key | undefined;
            expiresAt?: number | undefined;
        }[];
    } | {
        type: `@rrc/${N}/clearQueryState`;
        queries: {
            query: keyof QP & keyof QR;
            cacheKey?: Key | undefined;
        }[];
    } | {
        type: `@rrc/${N}/clearMutationState`;
        mutationKeys: (keyof MP & keyof MR)[];
    }) => {
        entities: import("./types").EntitiesMap<T>;
        queries: QP | QR extends infer T_3 ? { [QK in keyof T_3]: import("./types").Dict<QueryState<QP[QK], QR[QK]> | undefined>; } : never;
        mutations: MP | MR extends infer T_4 ? { [MK in keyof T_4]: MutationState<MP[MK], MR[MK]>; } : never;
    };
    actions: {
        updateQueryStateAndEntities: {
            <K extends keyof QP & keyof QR>(queryKey: K, queryCacheKey: Key, state?: Partial<QueryState<QP[K], QR[K]>> | undefined, entityChanges?: import("./types").EntityChanges<T> | undefined): {
                type: `@rrc/${N}/updateQueryStateAndEntities`;
                queryKey: K;
                queryCacheKey: Key;
                state: Partial<QueryState<QP[K], QR[K]>> | undefined;
                entityChanges: import("./types").EntityChanges<T> | undefined;
            };
            type: `@rrc/${N}/updateQueryStateAndEntities`;
        };
        updateMutationStateAndEntities: {
            <K_1 extends keyof MP & keyof MR>(mutationKey: K_1, state?: Partial<MutationState<MP[K_1], MR[K_1]>> | undefined, entityChanges?: import("./types").EntityChanges<T> | undefined): {
                type: `@rrc/${N}/updateMutationStateAndEntities`;
                mutationKey: K_1;
                state: Partial<MutationState<MP[K_1], MR[K_1]>> | undefined;
                entityChanges: import("./types").EntityChanges<T> | undefined;
            };
            type: `@rrc/${N}/updateMutationStateAndEntities`;
        };
        mergeEntityChanges: {
            (changes: import("./types").EntityChanges<T>): {
                type: `@rrc/${N}/mergeEntityChanges`;
                changes: import("./types").EntityChanges<T>;
            };
            type: `@rrc/${N}/mergeEntityChanges`;
        };
        invalidateQuery: {
            <K_2 extends keyof QP & keyof QR>(queries: {
                query: K_2;
                cacheKey?: Key | undefined;
                expiresAt?: number | undefined;
            }[]): {
                type: `@rrc/${N}/invalidateQuery`;
                queries: {
                    query: K_2;
                    cacheKey?: Key | undefined;
                    expiresAt?: number | undefined;
                }[];
            };
            type: `@rrc/${N}/invalidateQuery`;
        };
        clearQueryState: {
            <K_3 extends keyof QP & keyof QR>(queries: {
                query: K_3;
                cacheKey?: Key | undefined;
            }[]): {
                type: `@rrc/${N}/clearQueryState`;
                queries: {
                    query: K_3;
                    cacheKey?: Key | undefined;
                }[];
            };
            type: `@rrc/${N}/clearQueryState`;
        };
        clearMutationState: {
            <K_4 extends keyof MP & keyof MR>(mutationKeys: K_4[]): {
                type: `@rrc/${N}/clearMutationState`;
                mutationKeys: K_4[];
            };
            type: `@rrc/${N}/clearMutationState`;
        };
    };
    selectors: {
        /** Selects query state. */
        selectQueryState: <QK_1 extends keyof QP | keyof QR>(state: unknown, query: QK_1, cacheKey: Key) => QueryState<QK_1 extends keyof QP & keyof QR ? QP[QK_1] : never, QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never>;
        /** Selects query latest result. */
        selectQueryResult: <QK_2 extends keyof QP | keyof QR>(state: unknown, query: QK_2, cacheKey: Key) => (QK_2 extends keyof QP & keyof QR ? QR[QK_2] : never) | undefined;
        /** Selects query loading state. */
        selectQueryLoading: <QK_3 extends keyof QP | keyof QR>(state: unknown, query: QK_3, cacheKey: Key) => boolean;
        /** Selects query latest error. */
        selectQueryError: <QK_4 extends keyof QP | keyof QR>(state: unknown, query: QK_4, cacheKey: Key) => Error | undefined;
        /** Selects query latest params. */
        selectQueryParams: <QK_5 extends keyof QP | keyof QR>(state: unknown, query: QK_5, cacheKey: Key) => (QK_5 extends keyof QP & keyof QR ? QP[QK_5] : never) | undefined;
        /** Selects query expiresAt value. */
        selectQueryExpiresAt: <QK_6 extends keyof QP | keyof QR>(state: unknown, query: QK_6, cacheKey: Key) => number | undefined;
        /** Selects mutation state. */
        selectMutationState: <MK_1 extends keyof MP | keyof MR>(state: unknown, mutation: MK_1) => MutationState<MK_1 extends keyof MP & keyof MR ? MP[MK_1] : never, MK_1 extends keyof MP & keyof MR ? MR[MK_1] : never>;
        /** Selects mutation latest result. */
        selectMutationResult: <MK_2 extends keyof MP | keyof MR>(state: unknown, mutation: MK_2) => (MK_2 extends keyof MP & keyof MR ? MR[MK_2] : never) | undefined;
        /** Selects mutation loading state. */
        selectMutationLoading: <MK_3 extends keyof MP | keyof MR>(state: unknown, mutation: MK_3) => boolean;
        /** Selects mutation latest error. */
        selectMutationError: <MK_4 extends keyof MP | keyof MR>(state: unknown, mutation: MK_4) => Error | undefined;
        /** Selects mutation latest params. */
        selectMutationParams: <MK_5 extends keyof MP | keyof MR>(state: unknown, mutation: MK_5) => (MK_5 extends keyof MP & keyof MR ? MP[MK_5] : never) | undefined;
        /** Selects entity by id and typename. */
        selectEntityById: <TN extends keyof T>(state: unknown, id: Key | null | undefined, typename: TN) => T[TN] | undefined;
        /** Selects all entities. */
        selectEntities: (state: unknown) => import("./types").EntitiesMap<T>;
        /** Selects all entities of provided typename. */
        selectEntitiesByTypename: <TN_1 extends keyof T>(state: unknown, typename: TN_1) => import("./types").EntitiesMap<T>[TN_1];
    };
    hooks: {
        /** Returns client object with query and mutate functions. */
        useClient: () => {
            query: <QK_7 extends keyof QP | keyof QR>(options: QueryOptions<T, QP, QR, QK_7>) => Promise<QueryResult<QK_7 extends keyof QP & keyof QR ? QR[QK_7] : never>>;
            mutate: <MK_6 extends keyof MP | keyof MR>(options: MutateOptions<T, MP, MR, MK_6>) => Promise<MutationResult<MK_6 extends keyof MP & keyof MR ? MR[MK_6] : never>>;
        };
        /** Fetches query when params change and subscribes to query state changes (except `expiresAt` field). */
        useQuery: <QK_8 extends keyof QP | keyof QR>(options: import("./types").UseQueryOptions<T, QP, QR, QK_8>) => readonly [Omit<QueryState<QK_8 extends keyof QP & keyof QR ? QP[QK_8] : never, QK_8 extends keyof QP & keyof QR ? QR[QK_8] : never>, "expiresAt">, (options?: Partial<Pick<QueryOptions<T, QP, QR, QK_8>, "params" | "onlyIfExpired">> | undefined) => Promise<QueryResult<QK_8 extends infer T_5 ? T_5 extends QK_8 ? T_5 extends keyof QP & keyof QR ? QR[T_5] : never : never : never>>];
        /** Subscribes to provided mutation state and provides mutate function. */
        useMutation: <MK_7 extends keyof MP | keyof MR>(options: Omit<MutateOptions<T, MP, MR, MK_7>, "params">) => readonly [(params: MK_7 extends keyof MP & keyof MR ? MP[MK_7] : never) => Promise<MutationResult<MK_7 extends infer T_6 ? T_6 extends MK_7 ? T_6 extends keyof MP & keyof MR ? MR[T_6] : never : never : never>>, MutationState<MK_7 extends keyof MP & keyof MR ? MP[MK_7] : never, MK_7 extends keyof MP & keyof MR ? MP[MK_7] : never>, () => boolean];
        /** useSelector + selectEntityById. */
        useSelectEntityById: <TN_2 extends keyof T>(id: Key | null | undefined, typename: TN_2) => T[TN_2] | undefined;
    };
    utils: {
        /**
         * Apply changes to the entities map.
         * @return `undefined` if nothing to change, otherwise new entities map with applied changes.
         */
        applyEntityChanges: (entities: import("./types").EntitiesMap<T>, changes: import("./types").EntityChanges<T>) => import("./types").EntitiesMap<T> | undefined;
    };
};
