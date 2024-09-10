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
        queries: { [QK in keyof QR]: import("./types").Dict<QueryMutationState<QR[QK]>>; };
        mutations: { [MK in keyof MR]: QueryMutationState<MR[MK]>; };
    } | undefined, action: {
        type: `@rrc/${N}/updateQueryStateAndEntities`;
        queryKey: keyof QR;
        queryCacheKey: Key;
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
            cacheKey?: Key | undefined;
        }[];
    } | {
        type: `@rrc/${N}/clearMutationState`;
        mutationKeys: (keyof MR)[];
    }) => {
        entities: import("./types").EntitiesMap<T>;
        queries: { [QK in keyof QR]: import("./types").Dict<QueryMutationState<QR[QK]>>; };
        mutations: { [MK in keyof MR]: QueryMutationState<MR[MK]>; };
    };
    actions: {
        updateQueryStateAndEntities: {
            <K extends keyof QR>(queryKey: K, queryCacheKey: Key, state?: Partial<QueryMutationState<QR[K]>> | undefined, entityChagnes?: import("./types").EntityChanges<T> | undefined): {
                type: `@rrc/${N}/updateQueryStateAndEntities`;
                queryKey: K;
                queryCacheKey: Key;
                state: Partial<QueryMutationState<QR[K]>> | undefined;
                entityChagnes: import("./types").EntityChanges<T> | undefined;
            };
            type: `@rrc/${N}/updateQueryStateAndEntities`;
        };
        updateMutationStateAndEntities: {
            <K_1 extends keyof MR>(mutationKey: K_1, state?: Partial<QueryMutationState<MR[K_1]>> | undefined, entityChagnes?: import("./types").EntityChanges<T> | undefined): {
                type: `@rrc/${N}/updateMutationStateAndEntities`;
                mutationKey: K_1;
                state: Partial<QueryMutationState<MR[K_1]>> | undefined;
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
        }; /** Selects query latest result. */
    };
    selectors: {
        /** Selects query state. */
        selectQueryState: <QK_1 extends keyof QR | keyof QP>(state: unknown, query: QK_1, cacheKey: Key) => QueryMutationState<QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never> | undefined;
        /** Selects query latest result. */
        selectQueryResult: <QK_2 extends keyof QR | keyof QP>(state: unknown, query: QK_2, cacheKey: Key) => (QK_2 extends keyof QP & keyof QR ? QR[QK_2] : never) | undefined;
        /** Selects query loading state. */
        selectQueryLoading: <QK_3 extends keyof QR | keyof QP>(state: unknown, query: QK_3, cacheKey: Key) => boolean | undefined;
        /** Selects query latest error. */
        selectQueryError: <QK_4 extends keyof QR | keyof QP>(state: unknown, query: QK_4, cacheKey: Key) => Error | undefined;
        /** Selects mutation state. */
        selectMutationState: <MK_1 extends keyof MP | keyof MR>(state: unknown, mutation: MK_1) => QueryMutationState<MK_1 extends keyof MP & keyof MR ? MR[MK_1] : never>;
        /** Selects mutation latest result. */
        selectMutationResult: <MK_2 extends keyof MP | keyof MR>(state: unknown, mutation: MK_2) => (MK_2 extends keyof MP & keyof MR ? MR[MK_2] : never) | undefined;
        /** Selects mutation loading state. */
        selectMutationLoading: <MK_3 extends keyof MP | keyof MR>(state: unknown, mutation: MK_3) => boolean;
        /** Selects mutation latest error. */
        selectMutationError: <MK_4 extends keyof MP | keyof MR>(state: unknown, mutation: MK_4) => Error | undefined;
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
            query: <QK_5 extends keyof QR | keyof QP>(options: Omit<QueryOptions<T, QP, QR, MR, QK_5>, "cachePolicy">) => Promise<QueryResult<QK_5 extends keyof QP & keyof QR ? QR[QK_5] : never>>;
            mutate: <MK_5 extends keyof MP | keyof MR>(options: {
                mutation: MK_5;
                params: MK_5 extends keyof MP & keyof MR ? MP[MK_5] : never;
            }) => Promise<MutationResult<MK_5 extends keyof MP & keyof MR ? MR[MK_5] : never>>;
        };
        /** Fetches query when params change and subscribes to query state. */
        useQuery: <QK_6 extends keyof QR | keyof QP>(options: import("./types").UseQueryOptions<T, QP, QR, MR, QK_6>) => readonly [QueryMutationState<QK_6 extends keyof QP & keyof QR ? QR[QK_6] : never>, () => Promise<QueryResult<QK_6 extends infer T_1 ? T_1 extends QK_6 ? T_1 extends keyof QP & keyof QR ? QR[T_1] : never : never : never>>];
        /** Subscribes to provided mutation state and provides mutate function. */
        useMutation: <MK_6 extends keyof MP | keyof MR>(options: {
            mutation: MK_6;
        }) => readonly [(params: MK_6 extends keyof MP & keyof MR ? MP[MK_6] : never) => Promise<MutationResult<MK_6 extends infer T_2 ? T_2 extends MK_6 ? T_2 extends keyof MP & keyof MR ? MR[T_2] : never : never : never>>, QueryMutationState<MK_6 extends keyof MP & keyof MR ? MP[MK_6] : never>, () => boolean];
    };
    utils: {
        /**
         * Apply changes to the entities map.
         * @return `undefined` if nothing to change, otherwise new entities map with applied changes.
         */
        applyEntityChanges: (entities: import("./types").EntitiesMap<T>, changes: import("./types").EntityChanges<T>) => import("./types").EntitiesMap<T> | undefined;
    };
};
