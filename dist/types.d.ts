import { Store } from 'redux';
import type { ReduxCacheState } from './reducer';
export type Key = string | number | symbol;
export type Dict<T> = Record<Key, T>;
export type OptionalPartial<T, K extends keyof T> = Partial<{
    [A in K]: Partial<T[A]>;
}> & Omit<T, K>;
/** Entity changes to be merged to redux state. */
export type EntityChanges<T extends Typenames> = {
    /** Entities that will be merged with existing. */
    merge?: PartialEntitiesMap<T>;
    /** Entities that will replace existing. */
    replace?: Partial<EntitiesMap<T>>;
    /** Ids of entities that will be removed. */
    remove?: EntityIds<T>;
    /** Alias for `merge` to support normalizr. */
    entities?: EntityChanges<T>['merge'];
};
/** Record of typename and its corresponding entity type */
export type Typenames = Record<string, object>;
export type Cache<N extends string, T extends Typenames, QP, QR, MP, MR> = {
    /** Used as prefix for actions and in default cacheStateSelector for selecting cache state from redux state. */
    name: N;
    /** Mapping of all typenames to their entity types, which is needed for proper typing and normalization.
     * Empty objects with type casting can be used as values.
     * @example
     * typenames: {
        users: {} as User, // here `users` entities will have type `User`
        banks: {} as Bank,
    } */
    typenames: T;
    queries: {
        [QK in keyof (QP & QR)]: QK extends keyof (QP | QR) ? QueryInfo<T, QP[QK], QR[QK], ReduxCacheState<T, QR, MR>> : never;
    };
    mutations: {
        [MK in keyof (MP & MR)]: MK extends keyof (MP | MR) ? MutationInfo<T, MP[MK], MR[MK]> : never;
    };
    options: CacheOptions;
    /** Should return cache state from redux root state. Default implementation returns `state[name]`. */
    cacheStateSelector: (state: any) => ReduxCacheState<T, QR, MR>;
};
export type CacheOptions = {
    /**
     * Enables validation of package function arguments. Recommened to enable in dev/testing mode.
     * Default is true in dev mode.
     * */
    validateFunctionArguments: boolean;
    /**
     * Enable console logs.
     * Default is false.
     */
    logsEnabled: boolean;
};
export type PartialEntitiesMap<T extends Typenames> = {
    [K in keyof T]?: Dict<Partial<T[K]>>;
};
export type EntitiesMap<T extends Typenames> = {
    [K in keyof T]: Dict<T[K]>;
};
export type EntityIds<T extends Typenames> = {
    [K in keyof T]?: Key[];
};
export type Query<T extends Typenames, P, R> = (params: P) => Promise<QueryResponse<T, R>>;
export type QueryInfo<T extends Typenames, P, R, S> = {
    query: Query<T, P, R>;
    /**
     * Cache policy.
     * @default cache-first
     */
    cachePolicy?: QueryCachePolicy;
    /**
     * Selector for query result from redux state.
     * Can prevent hook from doing unnecessary fetches.
     * Needed when query result may already be in the cache, e.g. for single entity query by id.
     * */
    resultSelector?: (state: S, params: P) => R | undefined;
    /** Merges results before saving to the store. Default implementation is using the latest result. */
    mergeResults?: (oldResult: R | undefined, response: QueryResponse<T, R>, params: P | undefined, store: Store) => R;
    /**
     * Cache key is used for storing the query state and for performing a fetch when it changes. Queries with the same cache key share their state.
     * Default implementation uses `JSON.stringify` or `String()` depending on type.
     * It is recommended to override it when default implementation is not optimal or when keys in params object can be sorted in random order etc.
     * */
    getCacheKey?: (params?: P) => Key;
};
export type UseQueryOptions<T extends Typenames, QP, QR, MR, QK extends keyof (QP & QR)> = {
    query: QK;
    params: QK extends keyof (QP | QR) ? QP[QK] : never;
    skip?: boolean;
} & Pick<QK extends keyof (QP | QR) ? QueryInfo<T, QP[QK], QR[QK], ReduxCacheState<T, QR, MR>> : never, 'cachePolicy'>;
/**
 * @param cache-first for each params key fetch is not called if cache exists.
 * @param cache-and-fetch for each params key result is taken from cache and fetch is called.
 */
export type QueryCachePolicy = 'cache-first' | 'cache-and-fetch';
export type QueryResponse<T extends Typenames, R> = EntityChanges<T> & {
    /** Normalized result of a query. */
    result: R;
};
export type QueryResult<R> = {
    error?: unknown;
    cancelled?: true;
    result?: R;
};
export type QueryOptions<T extends Typenames, QP, QR, MR, QK extends keyof (QP & QR)> = Omit<UseQueryOptions<T, QP, QR, MR, QK>, 'skip'>;
export type Mutation<T extends Typenames, P, R> = (params: P, 
/** Signal is aborted for current mutation when the same mutation was called once again. */
abortSignal: AbortSignal) => Promise<MutationResponse<T, R>>;
export type MutationInfo<T extends Typenames, P, R> = {
    mutation: Mutation<T, P, R>;
};
export type MutationResponse<T extends Typenames, R> = EntityChanges<T> & {
    /** Normalized result of a mutation. */
    result?: R;
};
export type MutationResult<R> = {
    error?: unknown;
    aborted?: true;
    result?: R;
};
export type QueryMutationState<R> = {
    /** `true` when query or mutation is currently in progress. */
    loading: boolean;
    /** Result of the latest successfull response. */
    result?: R;
    /** Error of the latest response. */
    error?: Error;
};
