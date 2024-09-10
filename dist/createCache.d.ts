import type { Cache, Key, MutationResult, OptionalPartial, QueryMutationState, QueryOptions, QueryResult, Typenames } from './types';
import { useMutation } from './useMutation';
import { useQuery } from './useQuery';
import { applyEntityChanges } from './utilsAndConstants';
/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
export declare const createCache: <N extends string, T extends Typenames, QP, QR, MP, MR>(partialCache: OptionalPartial<Cache<N, T, QP, QR, MP, MR>, "options" | "queries" | "mutations" | "cacheStateSelector">) => {
    /** Keeps all options, passed while creating the cache. */
    cache: Cache<N, T, QP, QR, MP, MR>;
    /** Reducer of the cache, should be added to redux store. */
    reducer: (state: {
        entities: import("./types").EntitiesMap<T>;
        queries: QP | QR extends infer T_1 ? { [QK in keyof T_1]: import("./types").Dict<QueryMutationState<QP[QK], QR[QK]>>; } : never;
        mutations: MP | MR extends infer T_2 ? { [MK in keyof T_2]: QueryMutationState<MP[MK], MR[MK]>; } : never;
    } | undefined, action: {
        type: `@rrc/${N}/updateQueryStateAndEntities`;
        queryKey: keyof QP & keyof QR;
        queryCacheKey: Key;
        state: Partial<QueryMutationState<QP[keyof QP & keyof QR], QR[keyof QP & keyof QR]>> | undefined;
        entityChagnes: import("./types").EntityChanges<T> | undefined;
    } | {
        type: `@rrc/${N}/updateMutationStateAndEntities`;
        mutationKey: keyof MP & keyof MR;
        state: Partial<QueryMutationState<MP[keyof MP & keyof MR], MR[keyof MP & keyof MR]>> | undefined;
        entityChagnes: import("./types").EntityChanges<T> | undefined;
    } | {
        type: `@rrc/${N}/mergeEntityChanges`;
        changes: import("./types").EntityChanges<T>;
    } | {
        type: `@rrc/${N}/clearQueryState`;
        queryKeys: {
            key: keyof QP & keyof QR;
            cacheKey?: Key | undefined;
        }[];
    } | {
        type: `@rrc/${N}/clearMutationState`;
        mutationKeys: (keyof MP & keyof MR)[];
    }) => {
        entities: import("./types").EntitiesMap<T>;
        queries: QP | QR extends infer T_3 ? { [QK in keyof T_3]: import("./types").Dict<QueryMutationState<QP[QK], QR[QK]>>; } : never;
        mutations: MP | MR extends infer T_4 ? { [MK in keyof T_4]: QueryMutationState<MP[MK], MR[MK]>; } : never;
    };
    actions: {
        updateQueryStateAndEntities: {
            <K extends keyof QP & keyof QR>(queryKey: K, queryCacheKey: Key, state?: Partial<QueryMutationState<QP[K], QR[K]>> | undefined, entityChagnes?: import("./types").EntityChanges<T> | undefined): {
                type: `@rrc/${N}/updateQueryStateAndEntities`;
                queryKey: K;
                queryCacheKey: Key;
                state: Partial<QueryMutationState<QP[K], QR[K]>> | undefined;
                entityChagnes: import("./types").EntityChanges<T> | undefined;
            };
            type: `@rrc/${N}/updateQueryStateAndEntities`;
        };
        updateMutationStateAndEntities: {
            <K_1 extends keyof MP & keyof MR>(mutationKey: K_1, state?: Partial<QueryMutationState<MP[K_1], MR[K_1]>> | undefined, entityChagnes?: import("./types").EntityChanges<T> | undefined): {
                type: `@rrc/${N}/updateMutationStateAndEntities`;
                mutationKey: K_1;
                state: Partial<QueryMutationState<MP[K_1], MR[K_1]>> | undefined;
                entityChagnes: import("./types").EntityChanges<T> | undefined;
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
        clearMutationState: {
            <K_3 extends keyof MP & keyof MR>(mutationKeys: K_3[]): {
                type: `@rrc/${N}/clearMutationState`;
                mutationKeys: K_3[];
            };
            type: `@rrc/${N}/clearMutationState`;
        };
    };
    selectors: {
        /** Selects query state. */
        selectQueryState: <QK_1 extends keyof QP | keyof QR>(state: unknown, query: QK_1, cacheKey: Key) => QueryMutationState<QK_1 extends keyof QP & keyof QR ? QP[QK_1] : never, QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never> | undefined;
        /** Selects query latest result. */
        selectQueryResult: <QK_2 extends keyof QP | keyof QR>(state: unknown, query: QK_2, cacheKey: Key) => (QK_2 extends keyof QP & keyof QR ? QR[QK_2] : never) | undefined;
        /** Selects query loading state. */
        selectQueryLoading: <QK_3 extends keyof QP | keyof QR>(state: unknown, query: QK_3, cacheKey: Key) => boolean | undefined;
        /** Selects query latest error. */
        selectQueryError: <QK_4 extends keyof QP | keyof QR>(state: unknown, query: QK_4, cacheKey: Key) => Error | undefined;
        /** Selects query latest params. */
        selectQueryParams: <QK_5 extends keyof QP | keyof QR>(state: unknown, query: QK_5, cacheKey: Key) => (QK_5 extends keyof QP & keyof QR ? QP[QK_5] : never) | undefined;
        /** Selects mutation state. */
        selectMutationState: <MK_1 extends keyof MP | keyof MR>(state: unknown, mutation: MK_1) => QueryMutationState<MK_1 extends keyof MP & keyof MR ? MP[MK_1] : never, MK_1 extends keyof MP & keyof MR ? MR[MK_1] : never>;
        /** Selects mutation latest result. */
        selectMutationResult: <MK_2 extends keyof MP | keyof MR>(state: unknown, mutation: MK_2) => (MK_2 extends keyof MP & keyof MR ? MR[MK_2] : never) | undefined;
        /** Selects mutation loading state. */
        selectMutationLoading: <MK_3 extends keyof MP | keyof MR>(state: unknown, mutation: MK_3) => boolean;
        /** Selects mutation latest error. */
        selectMutationError: <MK_4 extends keyof MP | keyof MR>(state: unknown, mutation: MK_4) => Error | undefined;
        /** Selects mutation latest params. */
        selectMutationParams: <MK_5 extends keyof MP | keyof MR>(state: unknown, mutation: MK_5) => MK_5 extends keyof MP & keyof MR ? MP[MK_5] : never;
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
            query: <QK_6 extends keyof QP | keyof QR>(options: Omit<QueryOptions<T, QP, QR, QK_6>, "cachePolicy">) => Promise<QueryResult<QK_6 extends keyof QP & keyof QR ? QR[QK_6] : never>>;
            mutate: <MK_6 extends keyof MP | keyof MR>(options: {
                mutation: MK_6;
                params: MK_6 extends keyof MP & keyof MR ? MP[MK_6] : never;
            }) => Promise<MutationResult<MK_6 extends keyof MP & keyof MR ? MR[MK_6] : never>>;
        };
        /** Fetches query when params change and subscribes to query state. */
        useQuery: <QK_7 extends keyof QP | keyof QR>(options: import("./types").UseQueryOptions<T, QP, QR, QK_7>) => readonly [QueryMutationState<QK_7 extends keyof QP & keyof QR ? QP[QK_7] : never, QK_7 extends keyof QP & keyof QR ? QR[QK_7] : never>, () => Promise<QueryResult<QK_7 extends infer T_5 ? T_5 extends QK_7 ? T_5 extends keyof QP & keyof QR ? QR[T_5] : never : never : never>>];
        /** Subscribes to provided mutation state and provides mutate function. */
        useMutation: <MK_7 extends keyof MP | keyof MR>(options: {
            mutation: MK_7;
        }) => readonly [(params: MK_7 extends keyof MP & keyof MR ? MP[MK_7] : never) => Promise<MutationResult<MK_7 extends infer T_6 ? T_6 extends MK_7 ? T_6 extends keyof MP & keyof MR ? MR[T_6] : never : never : never>>, QueryMutationState<MK_7 extends keyof MP & keyof MR ? MP[MK_7] : never, MK_7 extends keyof MP & keyof MR ? MP[MK_7] : never>, () => boolean];
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
