import type { Cache, EntitiesMap, Key, MutationResult, OptionalPartial, QueryOptions, QueryResult, Typenames } from './types';
import { useMutation } from './useMutation';
import { useQuery } from './useQuery';
import { applyEntityChanges } from './utilsAndConstants';
/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
export declare const createCache: <N extends string, T extends Typenames, QP, QR, MP, MR>(partialCache: OptionalPartial<Cache<N, T, QP, QR, MP, MR>, "options" | "queries" | "mutations" | "cacheStateSelector">) => {
    cache: Cache<N, T, QP, QR, MP, MR>;
    /** Reducer of the cache, should be added to redux store. */
    reducer: (state: {
        entities: EntitiesMap<T>;
        queries: { [QK in keyof QR]: import("./types").Dict<import("./types").QueryMutationState<QR[QK]>>; };
        mutations: { [MK in keyof MR]: import("./types").QueryMutationState<MR[MK]>; };
    } | undefined, action: {
        type: `@rrc/${N}/updateQueryStateAndEntities`;
        queryKey: keyof QR;
        queryCacheKey: Key;
        state: Partial<import("./types").QueryMutationState<QR[keyof QR]>> | undefined;
        entityChagnes: import("./types").EntityChanges<T> | undefined;
    } | {
        type: `@rrc/${N}/updateMutationStateAndEntities`;
        mutationKey: keyof MR;
        state: Partial<import("./types").QueryMutationState<MR[keyof MR]>> | undefined;
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
        mutationKeys: (keyof MR)[]; /** Select all entities of provided typename. */
    }) => {
        entities: EntitiesMap<T>;
        queries: { [QK in keyof QR]: import("./types").Dict<import("./types").QueryMutationState<QR[QK]>>; };
        mutations: { [MK in keyof MR]: import("./types").QueryMutationState<MR[MK]>; };
    };
    actions: {
        updateQueryStateAndEntities: {
            <K extends keyof QR>(queryKey: K, queryCacheKey: Key, state?: Partial<import("./types").QueryMutationState<QR[K]>> | undefined, entityChagnes?: import("./types").EntityChanges<T> | undefined): {
                type: `@rrc/${N}/updateQueryStateAndEntities`;
                queryKey: K;
                queryCacheKey: Key;
                state: Partial<import("./types").QueryMutationState<QR[K]>> | undefined;
                entityChagnes: import("./types").EntityChanges<T> | undefined;
            };
            type: `@rrc/${N}/updateQueryStateAndEntities`;
        };
        updateMutationStateAndEntities: {
            <K_1 extends keyof MR>(mutationKey: K_1, state?: Partial<import("./types").QueryMutationState<MR[K_1]>> | undefined, entityChagnes?: import("./types").EntityChanges<T> | undefined): {
                type: `@rrc/${N}/updateMutationStateAndEntities`;
                mutationKey: K_1;
                state: Partial<import("./types").QueryMutationState<MR[K_1]>> | undefined;
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
                mutationKeys: K_3[]; /** Select all entities of provided typename. */
            };
            type: `@rrc/${N}/clearMutationState`;
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
            query: <QK_1 extends keyof QR | keyof QP>(options: QueryOptions<T, QP, QR, MR, QK_1>) => Promise<QueryResult<QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never>>;
            mutate: <MK_1 extends keyof MP | keyof MR>(options: {
                mutation: MK_1;
                params: MK_1 extends keyof MP & keyof MR ? MP[MK_1] : never;
            }) => Promise<MutationResult<MK_1 extends keyof MP & keyof MR ? MR[MK_1] : never>>;
        };
        /** Fetches query when params change and subscribes to query state. */
        useQuery: <QK_2 extends keyof QR | keyof QP>(options: import("./types").UseQueryOptions<T, QP, QR, MR, QK_2>) => readonly [import("./types").QueryMutationState<QK_2 extends keyof QP & keyof QR ? QR[QK_2] : never>, () => Promise<void>];
        /** Subscribes to provided mutation state and provides mutate function. */
        useMutation: <MK_2 extends keyof MP | keyof MR>(options: {
            mutation: MK_2;
        }) => readonly [(params: MK_2 extends keyof MP & keyof MR ? MP[MK_2] : never) => Promise<void>, import("./types").QueryMutationState<MK_2 extends keyof MP & keyof MR ? MP[MK_2] : never>, () => boolean];
        /** Selects entity by id and subscribes to the changes. */
        useSelectEntityById: <TN_1 extends keyof T>(id: Key | null | undefined, typename: TN_1) => T[TN_1] | undefined;
    };
    utils: {
        applyEntityChanges: (entities: EntitiesMap<T>, changes: import("./types").EntityChanges<T>) => EntitiesMap<T> | undefined;
    };
};
