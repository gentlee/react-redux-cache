import type { createCacheReducer, ReduxCacheState } from './reducer';
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
export type Cache<T extends Typenames, QP, QR, MP, MR> = {
    typenames: T;
    queries: {
        [QK in keyof (QP & QR)]: QK extends keyof (QP | QR) ? QueryInfo<T, QP[QK], QR[QK], ReturnType<ReturnType<typeof createCacheReducer<T, QP, QR, MP, MR>>>> : never;
    };
    mutations: {
        [MK in keyof (MP & MR)]: MK extends keyof (MP | MR) ? MutationInfo<T, MP[MK], MR[MK]> : never;
    };
    options: CacheOptions;
    /** Returns cache state from redux root state. */
    cacheStateSelector: (state: any) => ReduxCacheState<T, QP, QR, MP, MR>;
};
export type CacheOptions = {
    /**
     * Enables validation of package function arguments. Recommened to enable in dev/testing mode.
     * Default is true in dev mode.
     * */
    validateFunctionArguments: boolean;
    /**
     * Enables validation of package hook arguments. Recommened to enable in dev/testing mode and disable in production.
     * Should be disabled with hot reloading.
     * Default is true in dev mode without hot reloading.
     * */
    validateHookArguments: boolean;
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
     * Cache policy string or cache options object. After cache created, all strings are converted to objects.
     * Default is { policy: 'cache-first', cacheQueryState: true, cacheEntities: true }
     * @param cache-first for each params key fetch is not called if cache exists.
     * @param cache-and-fetch for each params key result is taken from cache and fetch is called.
     */
    cacheOptions?: QueryCacheOptions | QueryCachePolicy;
    /**
     * Selector for query result from redux state.
     * Can prevent hook from doing unnecessary fetches.
     * Needed when query result may already be in the cache, e.g. for single entity query by id.
     * */
    resultSelector?: (state: S, params: P) => R | undefined;
    /** Merges results before saving to the store. */
    mergeResults?: (oldResult: R | undefined, response: QueryResponse<T, R>, params: P | undefined) => R;
    /**
     * Params key is used for determining if parameters were changed and fetch is needed.
     * Also used as cache key, of `getCacheKey` wasn't provided.
     * Default implementation uses `JSON.stringify` or `String()` depending on type.
     * */
    getParamsKey?: (params?: P) => Key;
    /**
     * Cache key is a key in redux state for caching query state.
     * Queries with equal cache keys have the same state.
     * Default implementation is equal to `getParamsKey`.
     * */
    getCacheKey?: (params?: P) => Key;
};
export type UseQueryOptions<T extends Typenames, QP, QR, MP, MR, QK extends keyof (QP & QR)> = {
    query: QK;
    params: QK extends keyof (QP | QR) ? QP[QK] : never;
    skip?: boolean;
} & Pick<QK extends keyof (QP | QR) ? QueryInfo<T, QP[QK], QR[QK], ReduxCacheState<T, QP, QR, MP, MR>> : never, 'cacheOptions' | 'mergeResults' | 'getCacheKey'>;
/**
 * @param cache-first for each params key fetch is not called if cache exists.
 * @param cache-and-fetch for each params key result is taken from cache and fetch is called.
 */
export type QueryCachePolicy = 'cache-first' | 'cache-and-fetch';
export type QueryCacheOptions = {
    /**
     * @param cache-first for each params key fetch is not called if cache exists.
     * @param cache-and-fetch for each params key result is taken from cache and fetch is called.
     */
    policy: QueryCachePolicy;
    /** If `false`, query state is not saved in the store. Default is `true`. */
    cacheQueryState: boolean;
    /** If `false`, entities from response are not saved to the store. Default is `true`. */
    cacheEntities: boolean;
};
export type QueryResponse<T extends Typenames, R> = EntityChanges<T> & {
    /** Normalized result of a query. */
    result: R;
};
export type QueryResult<R> = {
    error?: unknown;
    cancelled?: true;
    result?: R;
};
export type QueryOptions<T extends Typenames, QP, QR, MP, MR, QK extends keyof (QP & QR)> = Omit<UseQueryOptions<T, QP, QR, MP, MR, QK>, 'skip'>;
export type Mutation<T extends Typenames, P, R> = (params: P, 
/** Signal is aborted for current mutation when the same mutation was called once again. */
abortSignal: AbortSignal) => Promise<MutationResponse<T, R>>;
export type MutationInfo<T extends Typenames, P, R> = {
    mutation: Mutation<T, P, R>;
    cacheOptions?: MutationCacheOptions;
};
export type MutationCacheOptions = Pick<QueryCacheOptions, 'cacheEntities'> & {
    /** If `false`, mutation state is not saved in the store. Default is `true`. */
    cacheMutationState: boolean;
};
export type MutationResponse<T extends Typenames, R> = EntityChanges<T> & {
    /** Normalized result of a mutation. */
    result?: R;
};
export type QueryMutationState<R> = {
    /** `true` when query or mutation is currently in progress. */
    loading: boolean;
    /** Result of the latest successfull query response. */
    result?: R;
    /** Error of the latest response. */
    error?: Error;
};
