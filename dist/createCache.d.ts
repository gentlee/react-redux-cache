import { clearMutationState, clearQueryState, mergeEntityChanges, updateMutationStateAndEntities, updateQueryStateAndEntities } from './actions';
import type { Cache, EntitiesMap, Key, MutationResult, OptionalPartial, QueryOptions, QueryResult, Typenames } from './types';
import { useMutation } from './useMutation';
import { useQuery } from './useQuery';
import { applyEntityChanges } from './utilsAndConstants';
/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
export declare const createCache: <T extends Typenames, QP, QR, MP, MR>(partialCache: OptionalPartial<Cache<T, QP, QR, MP, MR>, "queries" | "mutations" | "options">) => {
    cache: Cache<T, QP, QR, MP, MR>;
    /** Reducer of the cache, should be added to redux store. */
    reducer: (state: {
        entities: EntitiesMap<T>;
        queries: { [QK in keyof QR]: import("./types").Dict<import("./types").QueryMutationState<QR[QK]>>; };
        mutations: { [MK in keyof MR]: import("./types").QueryMutationState<MR[MK]>; };
    } | undefined, action: {
        type: `${string}MERGE_ENTITY_CHANGES`;
        changes: import("./types").EntityChanges<T>;
    } | {
        type: `${string}UPDATE_QUERY_STATE_AND_ENTITIES`;
        queryKey: keyof QR;
        queryCacheKey: Key;
        state: Partial<import("./types").QueryMutationState<QR[keyof QR]>> | undefined;
        entityChagnes: import("./types").EntityChanges<T> | undefined;
    } | {
        type: `${string}UPDATE_MUTATION_STATE_AND_ENTITIES`;
        mutationKey: keyof MR;
        state: Partial<import("./types").QueryMutationState<MR[keyof MR]>> | undefined;
        entityChagnes: import("./types").EntityChanges<T> | undefined;
    } | {
        type: `${string}CLEAR_QUERY_STATE`;
        queryKeys: {
            key: keyof QR;
            cacheKey?: Key | undefined;
        }[];
    } | {
        type: `${string}CLEAR_MUTATION_STATE`;
        mutationKeys: (keyof MR)[];
    }) => {
        entities: EntitiesMap<T>;
        queries: { [QK in keyof QR]: import("./types").Dict<import("./types").QueryMutationState<QR[QK]>>; };
        mutations: { [MK in keyof MR]: import("./types").QueryMutationState<MR[MK]>; };
    };
    actions: {
        /** Updates query state, and optionally merges entity changes in a single action. */
        updateQueryStateAndEntities: <K extends keyof QR>(queryKey: K, queryCacheKey: Key, state?: Partial<import("./types").QueryMutationState<QR[K]>> | undefined, entityChagnes?: import("./types").EntityChanges<T> | undefined) => {
            type: `${string}UPDATE_QUERY_STATE_AND_ENTITIES`;
            queryKey: K;
            queryCacheKey: Key;
            state: Partial<import("./types").QueryMutationState<QR[K]>> | undefined;
            entityChagnes: import("./types").EntityChanges<T> | undefined;
        };
        /** Updates mutation state, and optionally merges entity changes in a single action. */
        updateMutationStateAndEntities: <K_1 extends keyof MR>(mutationKey: K_1, state?: Partial<import("./types").QueryMutationState<MR[K_1]>> | undefined, entityChagnes?: import("./types").EntityChanges<T> | undefined) => {
            type: `${string}UPDATE_MUTATION_STATE_AND_ENTITIES`;
            mutationKey: K_1;
            state: Partial<import("./types").QueryMutationState<MR[K_1]>> | undefined;
            entityChagnes: import("./types").EntityChanges<T> | undefined;
        };
        /** Merge EntityChanges to the state. */
        mergeEntityChanges: (changes: import("./types").EntityChanges<T>) => {
            type: `${string}MERGE_ENTITY_CHANGES`;
            changes: import("./types").EntityChanges<T>;
        };
        /** Clear states for provided query keys and cache keys.
         * If cache key for query key is not provided, the whole state for query key is cleared. */
        clearQueryState: <K_2 extends keyof QR>(queryKeys: {
            key: K_2;
            cacheKey?: Key | undefined;
        }[]) => {
            type: `${string}CLEAR_QUERY_STATE`;
            queryKeys: {
                key: K_2;
                cacheKey?: Key | undefined;
            }[];
        };
        /** Clear states for provided mutation keys. */
        clearMutationState: <K_3 extends keyof MR>(mutationKeys: K_3[]) => {
            type: `${string}CLEAR_MUTATION_STATE`;
            mutationKeys: K_3[];
        };
    };
    selectors: {
        /** Select all entities from the state. */
        entitiesSelector: (state: unknown) => EntitiesMap<T>;
        /** Select all entities of provided typename. */
        entitiesByTypenameSelector: <TN extends keyof T>(typename: TN) => { [K_4 in keyof T]: (state: unknown) => EntitiesMap<T>[K_4]; }[TN];
    };
    hooks: {
        /** Returns client object with query function */
        useClient: () => {
            query: <QK_1 extends keyof QP | keyof QR>(options: QueryOptions<T, QP, QR, MP, MR, QK_1>) => Promise<QueryResult<QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never>>;
            mutate: <MK_1 extends keyof MP | keyof MR>(options: {
                mutation: MK_1;
                params: MK_1 extends keyof MP & keyof MR ? MP[MK_1] : never;
            }) => Promise<MutationResult<MK_1 extends keyof MP & keyof MR ? MR[MK_1] : never>>;
        };
        /** Fetches query when params change and subscribes to query state. */
        useQuery: <QK_2 extends keyof QP | keyof QR>(options: import("./types").UseQueryOptions<T, QP, QR, MP, MR, QK_2>) => readonly [import("./types").QueryMutationState<QK_2 extends keyof QP & keyof QR ? QR[QK_2] : never>, () => Promise<void>];
        /** Subscribes to provided mutation state and provides mutate function. */
        useMutation: <MK_2 extends keyof MP | keyof MR>(options: {
            mutation: MK_2;
        }) => readonly [(params: MK_2 extends keyof MP & keyof MR ? MP[MK_2] : never) => Promise<void>, import("./types").QueryMutationState<MK_2 extends keyof MP & keyof MR ? MP[MK_2] : never>, () => boolean];
        /** Selects entity by id and subscribes to the changes. */
        useSelectEntityById: <K_5 extends keyof T>(id: Key | null | undefined, typename: K_5) => T[K_5] | undefined;
    };
    utils: {
        applyEntityChanges: (entities: EntitiesMap<T>, changes: import("./types").EntityChanges<T>) => EntitiesMap<T> | undefined;
    };
};
