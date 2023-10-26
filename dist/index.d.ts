import { mergeEntityChanges, setMutationStateAndEntities, setQueryStateAndEntities } from './reducer';
import { Cache, EntitiesMap, Key, OptionalPartial, Typenames } from './types';
import { useMutation } from './useMutation';
import { useQuery } from './useQuery';
export * from './reducer';
export * from './types';
export * from './useMutation';
export * from './useQuery';
export * from './utilsAndConstants';
/** Creates reducer, actions and hooks for managing queries and mutations through redux cache. */
export declare const createCache: <T extends Typenames, QP, QR, MP, MR>(cache: OptionalPartial<Cache<T, QP, QR, MP, MR>, "options">) => {
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
        type: `${string}SET_QUERY_STATE_AND_ENTITIES`;
        queryKey: keyof QR;
        queryCacheKey: Key;
        state: Partial<import("./types").QueryMutationState<QR[keyof QR]>> | undefined;
        entityChagnes: import("./types").EntityChanges<T> | undefined;
    } | {
        type: `${string}SET_MUTATION_STATE_AND_ENTITIES`;
        mutationKey: keyof MR;
        state: Partial<import("./types").QueryMutationState<MR[keyof MR]>> | undefined;
        entityChagnes: import("./types").EntityChanges<T> | undefined;
    }) => {
        entities: EntitiesMap<T>;
        queries: { [QK in keyof QR]: import("./types").Dict<import("./types").QueryMutationState<QR[QK]>>; };
        mutations: { [MK in keyof MR]: import("./types").QueryMutationState<MR[MK]>; };
    };
    actions: {
        /** Updates query state, and optionally merges entity changes in a single action. */
        setQueryStateAndEntities: <K extends keyof QR>(queryKey: K, queryCacheKey: Key, state?: Partial<import("./types").QueryMutationState<QR[K]>> | undefined, entityChagnes?: import("./types").EntityChanges<T> | undefined) => {
            type: `${string}SET_QUERY_STATE_AND_ENTITIES`;
            queryKey: K;
            queryCacheKey: Key;
            state: Partial<import("./types").QueryMutationState<QR[K]>> | undefined;
            entityChagnes: import("./types").EntityChanges<T> | undefined;
        };
        /** Updates mutation state, and optionally merges entity changes in a single action. */
        setMutationStateAndEntities: <K_1 extends keyof MR>(mutationKey: K_1, state?: Partial<import("./types").QueryMutationState<MR[K_1]>> | undefined, entityChagnes?: import("./types").EntityChanges<T> | undefined) => {
            type: `${string}SET_MUTATION_STATE_AND_ENTITIES`;
            mutationKey: K_1;
            state: Partial<import("./types").QueryMutationState<MR[K_1]>> | undefined;
            entityChagnes: import("./types").EntityChanges<T> | undefined;
        };
        /** Merge EntityChanges to the state. */
        mergeEntityChanges: (changes: import("./types").EntityChanges<T>) => {
            type: `${string}MERGE_ENTITY_CHANGES`;
            changes: import("./types").EntityChanges<T>;
        };
    };
    selectors: {
        entitiesSelector: (state: any) => EntitiesMap<T>;
        entitiesByTypenameSelector: <TN extends keyof T>(typename: TN) => { [K_2 in keyof T]: (state: any) => EntitiesMap<T>[K_2]; }[TN];
    };
    hooks: {
        /** Fetches query when params change and subscribes to query state. */
        useQuery: <QK_1 extends keyof QP | keyof QR>(options: import("./types").UseQueryOptions<T, QP, QR, MP, MR, QK_1>) => readonly [import("./types").QueryMutationState<QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never>, (params?: (QK_1 extends keyof QP & keyof QR ? QP[QK_1] : never) | undefined) => Promise<void>];
        /** Subscribes to provided mutation state and provides mutate function. */
        useMutation: <MK_1 extends keyof MP | keyof MR>(options: {
            mutation: MK_1;
            cacheOptions?: import("./types").MutationCacheOptions | undefined;
        }) => readonly [(params: MK_1 extends keyof MP & keyof MR ? MP[MK_1] : never) => Promise<void>, import("./types").QueryMutationState<MK_1 extends keyof MP & keyof MR ? MP[MK_1] : never>, AbortController | undefined];
        /** Selects entity by id and subscribes to the changes. */
        useSelectEntityById: <K_3 extends keyof T>(id: Key | null | undefined, typename: K_3) => T[K_3] | undefined;
    };
};
