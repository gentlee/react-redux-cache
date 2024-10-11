import type { Cache, Key, MutateOptions, MutationResult, MutationState, OptionalPartial, QueryOptions, QueryResult, QueryState, Typenames } from './types';
import { useMutation } from './useMutation';
import { useQuery } from './useQuery';
import { applyEntityChanges } from './utilsAndConstants';
/**
 * Function to provide generic Typenames if normalization is needed - this is a Typescript limitation.
 * Returns object with createCache function with provided typenames.
 * @example
 * const cache = withTypenames<MyTypenames>().createCache({
 *   ...
 * })
 */
export declare const withTypenames: <T extends Typenames = Typenames>() => {
    createCache: <N extends string, QP, QR, MP, MR>(partialCache: OptionalPartial<Cache<N, T, QP, QR, MP, MR>, "options" | "queries" | "mutations" | "cacheStateSelector" | "globals">) => {
        /** Keeps all options, passed while creating the cache. */
        cache: Cache<N, T, QP, QR, MP, MR>;
        /** Reducer of the cache, should be added to redux store. */
        reducer: (state: {
            entities: import("./types").EntitiesMap<T>;
            queries: { [QK in keyof (QP | QR)]: import("./types").Dict<QueryState<QP[QK], QR[QK]> | undefined>; };
            mutations: { [MK in keyof (MP | MR)]: MutationState<MP[MK], MR[MK]>; };
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
                cacheKey?: Key;
                expiresAt?: number;
            }[];
        } | {
            type: `@rrc/${N}/clearQueryState`;
            queries: {
                query: keyof QP & keyof QR;
                cacheKey?: Key;
            }[];
        } | {
            type: `@rrc/${N}/clearMutationState`;
            mutationKeys: (keyof MP & keyof MR)[];
        }) => {
            entities: import("./types").EntitiesMap<T>;
            queries: { [QK in keyof (QP | QR)]: import("./types").Dict<QueryState<QP[QK], QR[QK]> | undefined>; };
            mutations: { [MK in keyof (MP | MR)]: MutationState<MP[MK], MR[MK]>; };
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
                <K extends keyof MP & keyof MR>(mutationKey: K, state?: Partial<MutationState<MP[K], MR[K]>> | undefined, entityChanges?: import("./types").EntityChanges<T> | undefined): {
                    type: `@rrc/${N}/updateMutationStateAndEntities`;
                    mutationKey: K;
                    state: Partial<MutationState<MP[K], MR[K]>> | undefined;
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
                <K extends keyof QP & keyof QR>(queries: {
                    query: K;
                    cacheKey?: Key;
                    expiresAt?: number;
                }[]): {
                    type: `@rrc/${N}/invalidateQuery`;
                    queries: {
                        query: K;
                        cacheKey?: Key;
                        expiresAt?: number;
                    }[];
                };
                type: `@rrc/${N}/invalidateQuery`;
            };
            clearQueryState: {
                <K extends keyof QP & keyof QR>(queries: {
                    query: K;
                    cacheKey?: Key;
                }[]): {
                    type: `@rrc/${N}/clearQueryState`;
                    queries: {
                        query: K;
                        cacheKey?: Key;
                    }[];
                };
                type: `@rrc/${N}/clearQueryState`;
            };
            clearMutationState: {
                <K extends keyof MP & keyof MR>(mutationKeys: K[]): {
                    type: `@rrc/${N}/clearMutationState`;
                    mutationKeys: K[];
                };
                type: `@rrc/${N}/clearMutationState`;
            };
        };
        selectors: {
            /** Selects query state. */
            selectQueryState: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => QueryState<QK extends keyof (QP | QR) ? QP[QK] : never, QK extends keyof (QP | QR) ? QR[QK] : never>;
            /** Selects query latest result. */
            selectQueryResult: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => (QK extends keyof QP & keyof QR ? QR[QK] : never) | undefined;
            /** Selects query loading state. */
            selectQueryLoading: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => boolean;
            /** Selects query latest error. */
            selectQueryError: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => Error | undefined;
            /** Selects query latest params. */
            selectQueryParams: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => (QK extends keyof QP & keyof QR ? QP[QK] : never) | undefined;
            /** Selects query latest expiresAt. */
            selectQueryExpiresAt: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => number | undefined;
            /** Selects mutation state. */
            selectMutationState: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => MutationState<MK extends keyof (MP | MR) ? MP[MK] : never, MK extends keyof (MP | MR) ? MR[MK] : never>;
            /** Selects mutation latest result. */
            selectMutationResult: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => (MK extends keyof MP & keyof MR ? MR[MK] : never) | undefined;
            /** Selects mutation loading state. */
            selectMutationLoading: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => boolean;
            /** Selects mutation latest error. */
            selectMutationError: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => Error | undefined;
            /** Selects mutation latest params. */
            selectMutationParams: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => (MK extends keyof MP & keyof MR ? MP[MK] : never) | undefined;
            /** Selects entity by id and typename. */
            selectEntityById: <TN extends keyof T>(state: unknown, id: Key | null | undefined, typename: TN) => T[TN] | undefined;
            /** Selects all entities. */
            selectEntities: (state: unknown) => import("./types").EntitiesMap<T>;
            /** Selects all entities of provided typename. */
            selectEntitiesByTypename: <TN extends keyof T>(state: unknown, typename: TN) => import("./types").EntitiesMap<T>[TN];
        };
        hooks: {
            /** Returns client object with query and mutate functions. */
            useClient: () => {
                query: <QK extends keyof (QP & QR)>(options: QueryOptions<T, QP, QR, QK>) => Promise<QueryResult<QK extends keyof QP & keyof QR ? QR[QK] : never>>;
                mutate: <MK extends keyof (MP & MR)>(options: MutateOptions<T, MP, MR, MK>) => Promise<MutationResult<MK extends keyof MP & keyof MR ? MR[MK] : never>>;
            };
            /** Fetches query when params change and subscribes to query state changes (except `expiresAt` field). */
            useQuery: <QK extends keyof (QP & QR)>(options: Parameters<typeof useQuery<N, T, QP, QR, MP, MR, QK>>[2]) => readonly [Omit<QueryState<QK extends keyof QP & keyof QR ? QP[QK] : never, QK extends keyof QP & keyof QR ? QR[QK] : never>, "expiresAt">, (options?: Partial<Pick<QueryOptions<T, QP, QR, QK>, "params" | "onlyIfExpired">> | undefined) => Promise<QueryResult<QK extends infer T_1 ? T_1 extends QK ? T_1 extends keyof QP & keyof QR ? QR[T_1] : never : never : never>>];
            /** Subscribes to provided mutation state and provides mutate function. */
            useMutation: <MK extends keyof (MP & MR)>(options: Parameters<typeof useMutation<N, T, MP, MR, MK>>[2]) => readonly [(params: MK extends keyof MP & keyof MR ? MP[MK] : never) => Promise<MutationResult<MK extends infer T_1 ? T_1 extends MK ? T_1 extends keyof MP & keyof MR ? MR[T_1] : never : never : never>>, MutationState<MK extends keyof MP & keyof MR ? MP[MK] : never, MK extends keyof MP & keyof MR ? MP[MK] : never>, () => boolean];
            /** useSelector + selectEntityById. */
            useSelectEntityById: <TN extends keyof T>(id: Key | null | undefined, typename: TN) => T[TN] | undefined;
        };
        utils: {
            /**
             * Apply changes to the entities map.
             * @return `undefined` if nothing to change, otherwise new entities map with applied changes.
             */
            applyEntityChanges: (entities: Parameters<typeof applyEntityChanges<T>>[0], changes: Parameters<typeof applyEntityChanges<T>>[1]) => import("./types").EntitiesMap<T> | undefined;
        };
    };
};
/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
export declare const createCache: <N extends string, QP, QR, MP, MR>(partialCache: OptionalPartial<Cache<N, Typenames, QP, QR, MP, MR>, "queries" | "options" | "mutations" | "cacheStateSelector" | "globals">) => {
    /** Keeps all options, passed while creating the cache. */
    cache: Cache<N, Typenames, QP, QR, MP, MR>;
    /** Reducer of the cache, should be added to redux store. */
    reducer: (state: {
        entities: import("./types").EntitiesMap<Typenames>;
        queries: { [QK in keyof (QP | QR)]: import("./types").Dict<QueryState<QP[QK], QR[QK]> | undefined>; };
        mutations: { [MK in keyof (MP | MR)]: MutationState<MP[MK], MR[MK]>; };
    } | undefined, action: {
        type: `@rrc/${N}/updateQueryStateAndEntities`;
        queryKey: keyof QP & keyof QR;
        queryCacheKey: Key;
        state: Partial<QueryState<QP[keyof QP & keyof QR], QR[keyof QP & keyof QR]>> | undefined;
        entityChanges: import("./types").EntityChanges<Typenames> | undefined;
    } | {
        type: `@rrc/${N}/updateMutationStateAndEntities`;
        mutationKey: keyof MP & keyof MR;
        state: Partial<MutationState<MP[keyof MP & keyof MR], MR[keyof MP & keyof MR]>> | undefined;
        entityChanges: import("./types").EntityChanges<Typenames> | undefined;
    } | {
        type: `@rrc/${N}/mergeEntityChanges`;
        changes: import("./types").EntityChanges<Typenames>;
    } | {
        type: `@rrc/${N}/invalidateQuery`;
        queries: {
            query: keyof QP & keyof QR;
            cacheKey?: Key;
            expiresAt?: number;
        }[];
    } | {
        type: `@rrc/${N}/clearQueryState`;
        queries: {
            query: keyof QP & keyof QR;
            cacheKey?: Key;
        }[];
    } | {
        type: `@rrc/${N}/clearMutationState`;
        mutationKeys: (keyof MP & keyof MR)[];
    }) => {
        entities: import("./types").EntitiesMap<Typenames>;
        queries: { [QK in keyof (QP | QR)]: import("./types").Dict<QueryState<QP[QK], QR[QK]> | undefined>; };
        mutations: { [MK in keyof (MP | MR)]: MutationState<MP[MK], MR[MK]>; };
    };
    actions: {
        updateQueryStateAndEntities: {
            <K extends keyof QP & keyof QR>(queryKey: K, queryCacheKey: Key, state?: Partial<QueryState<QP[K], QR[K]>> | undefined, entityChanges?: import("./types").EntityChanges<Typenames> | undefined): {
                type: `@rrc/${N}/updateQueryStateAndEntities`;
                queryKey: K;
                queryCacheKey: Key;
                state: Partial<QueryState<QP[K], QR[K]>> | undefined;
                entityChanges: import("./types").EntityChanges<Typenames> | undefined;
            };
            type: `@rrc/${N}/updateQueryStateAndEntities`;
        };
        updateMutationStateAndEntities: {
            <K extends keyof MP & keyof MR>(mutationKey: K, state?: Partial<MutationState<MP[K], MR[K]>> | undefined, entityChanges?: import("./types").EntityChanges<Typenames> | undefined): {
                type: `@rrc/${N}/updateMutationStateAndEntities`;
                mutationKey: K;
                state: Partial<MutationState<MP[K], MR[K]>> | undefined;
                entityChanges: import("./types").EntityChanges<Typenames> | undefined;
            };
            type: `@rrc/${N}/updateMutationStateAndEntities`;
        };
        mergeEntityChanges: {
            (changes: import("./types").EntityChanges<Typenames>): {
                type: `@rrc/${N}/mergeEntityChanges`;
                changes: import("./types").EntityChanges<Typenames>;
            };
            type: `@rrc/${N}/mergeEntityChanges`;
        };
        invalidateQuery: {
            <K extends keyof QP & keyof QR>(queries: {
                query: K;
                cacheKey?: Key;
                expiresAt?: number;
            }[]): {
                type: `@rrc/${N}/invalidateQuery`;
                queries: {
                    query: K;
                    cacheKey?: Key;
                    expiresAt?: number;
                }[];
            };
            type: `@rrc/${N}/invalidateQuery`;
        };
        clearQueryState: {
            <K extends keyof QP & keyof QR>(queries: {
                query: K;
                cacheKey?: Key;
            }[]): {
                type: `@rrc/${N}/clearQueryState`;
                queries: {
                    query: K;
                    cacheKey?: Key;
                }[];
            };
            type: `@rrc/${N}/clearQueryState`;
        };
        clearMutationState: {
            <K extends keyof MP & keyof MR>(mutationKeys: K[]): {
                type: `@rrc/${N}/clearMutationState`;
                mutationKeys: K[];
            };
            type: `@rrc/${N}/clearMutationState`;
        };
    };
    selectors: {
        /** Selects query state. */
        selectQueryState: <QK extends keyof QP | keyof QR>(state: unknown, query: QK, cacheKey: Key) => QueryState<QK extends keyof QP & keyof QR ? QP[QK] : never, QK extends keyof QP & keyof QR ? QR[QK] : never>;
        /** Selects query latest result. */
        selectQueryResult: <QK extends keyof QP | keyof QR>(state: unknown, query: QK, cacheKey: Key) => (QK extends keyof QP & keyof QR ? QR[QK] : never) | undefined;
        /** Selects query loading state. */
        selectQueryLoading: <QK extends keyof QP | keyof QR>(state: unknown, query: QK, cacheKey: Key) => boolean;
        /** Selects query latest error. */
        selectQueryError: <QK extends keyof QP | keyof QR>(state: unknown, query: QK, cacheKey: Key) => Error | undefined;
        /** Selects query latest params. */
        selectQueryParams: <QK extends keyof QP | keyof QR>(state: unknown, query: QK, cacheKey: Key) => (QK extends keyof QP & keyof QR ? QP[QK] : never) | undefined;
        /** Selects query latest expiresAt. */
        selectQueryExpiresAt: <QK extends keyof QP | keyof QR>(state: unknown, query: QK, cacheKey: Key) => number | undefined;
        /** Selects mutation state. */
        selectMutationState: <MK extends keyof MP | keyof MR>(state: unknown, mutation: MK) => MutationState<MK extends keyof MP & keyof MR ? MP[MK] : never, MK extends keyof MP & keyof MR ? MR[MK] : never>;
        /** Selects mutation latest result. */
        selectMutationResult: <MK extends keyof MP | keyof MR>(state: unknown, mutation: MK) => (MK extends keyof MP & keyof MR ? MR[MK] : never) | undefined;
        /** Selects mutation loading state. */
        selectMutationLoading: <MK extends keyof MP | keyof MR>(state: unknown, mutation: MK) => boolean;
        /** Selects mutation latest error. */
        selectMutationError: <MK extends keyof MP | keyof MR>(state: unknown, mutation: MK) => Error | undefined;
        /** Selects mutation latest params. */
        selectMutationParams: <MK extends keyof MP | keyof MR>(state: unknown, mutation: MK) => (MK extends keyof MP & keyof MR ? MP[MK] : never) | undefined;
        /** Selects entity by id and typename. */
        selectEntityById: <TN extends string>(state: unknown, id: Key | null | undefined, typename: TN) => object | undefined;
        /** Selects all entities. */
        selectEntities: (state: unknown) => import("./types").EntitiesMap<Typenames>;
        /** Selects all entities of provided typename. */
        selectEntitiesByTypename: <TN extends string>(state: unknown, typename: TN) => import("./types").Dict<object> | undefined;
    };
    hooks: {
        /** Returns client object with query and mutate functions. */
        useClient: () => {
            query: <QK extends keyof QP | keyof QR>(options: QueryOptions<Typenames, QP, QR, QK>) => Promise<QueryResult<QK extends keyof QP & keyof QR ? QR[QK] : never>>;
            mutate: <MK extends keyof MP | keyof MR>(options: MutateOptions<Typenames, MP, MR, MK>) => Promise<MutationResult<MK extends keyof MP & keyof MR ? MR[MK] : never>>;
        };
        /** Fetches query when params change and subscribes to query state changes (except `expiresAt` field). */
        useQuery: <QK extends keyof QP | keyof QR>(options: import("./types").UseQueryOptions<Typenames, QP, QR, QK>) => readonly [Omit<QueryState<QK extends keyof QP & keyof QR ? QP[QK] : never, QK extends keyof QP & keyof QR ? QR[QK] : never>, "expiresAt">, (options?: Partial<Pick<QueryOptions<Typenames, QP, QR, QK>, "params" | "onlyIfExpired">> | undefined) => Promise<QueryResult<QK extends infer T ? T extends QK ? T extends keyof QP & keyof QR ? QR[T] : never : never : never>>];
        /** Subscribes to provided mutation state and provides mutate function. */
        useMutation: <MK extends keyof MP | keyof MR>(options: Omit<MutateOptions<Typenames, MP, MR, MK>, "params">) => readonly [(params: MK extends keyof MP & keyof MR ? MP[MK] : never) => Promise<MutationResult<MK extends infer T ? T extends MK ? T extends keyof MP & keyof MR ? MR[T] : never : never : never>>, MutationState<MK extends keyof MP & keyof MR ? MP[MK] : never, MK extends keyof MP & keyof MR ? MP[MK] : never>, () => boolean];
        /** useSelector + selectEntityById. */
        useSelectEntityById: <TN extends string>(id: Key | null | undefined, typename: TN) => object | undefined;
    };
    utils: {
        /**
         * Apply changes to the entities map.
         * @return `undefined` if nothing to change, otherwise new entities map with applied changes.
         */
        applyEntityChanges: (entities: import("./types").EntitiesMap<Typenames>, changes: import("./types").EntityChanges<Typenames>) => import("./types").EntitiesMap<Typenames> | undefined;
    };
};
