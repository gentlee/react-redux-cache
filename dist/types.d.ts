import { Store } from 'redux';
import type { ReduxCacheState } from './createCacheReducer';
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
    queries: {
        [QK in keyof (QP & QR)]: QK extends keyof (QP | QR) ? QueryInfo<T, QP[QK], QR[QK]> : never;
    };
    mutations: {
        [MK in keyof (MP & MR)]: MK extends keyof (MP | MR) ? MutationInfo<T, MP[MK], MR[MK]> : never;
    };
    /** Default options for queries.
     * @default { cachePolicy: 'cache-first', sedondsToLive: undefined } */
    defaults: Defaults;
    options: CacheOptions;
    /** Should return cache state from redux root state. Default implementation returns `state[name]`. */
    cacheStateSelector: (state: any) => ReduxCacheState<T, QP, QR, MP, MR>;
};
export type Defaults = {
    /**
     * Cache policy.
     * @cache-first fetch only if cache either does not exist or is expired on useQuery mount.
     * @cache-and-fetch fetch on every useQuery mount.
     * @default cache-first
     */
    cachePolicy: QueryCachePolicy;
    /** If set, this value updates expiresAt value of query state when query result is received. */
    secondsToLive?: number;
};
export type CacheOptions = {
    /**
     * Enables validation of package function arguments. Recommened to enable in dev/testing mode.
     * @default true in dev mode.
     * */
    validateFunctionArguments: boolean;
    /**
     * Enables console logs.
     * @default false
     */
    logsEnabled: boolean;
    /**
     * Enables deep comparison before merging entities to the state.
     * Re-rendering is a heavier operation than comparison, so disabling it can lead to performance drop.
     * Makes sense to disable only if merging equal results & entities to the state is a rare case.
     * @default true
     */
    deepComparisonEnabled: boolean;
};
export type PartialEntitiesMap<T extends Typenames> = {
    [K in keyof T]?: Dict<Partial<T[K]>>;
};
export type EntitiesMap<T extends Typenames> = {
    [K in keyof T]?: Dict<T[K]>;
};
export type EntityIds<T extends Typenames> = {
    [K in keyof T]?: Key[];
};
export type Query<P, T extends Typenames = Typenames, R = unknown> = (
/** Query parameters */
params: P, 
/** Redux store */
store: Store) => Promise<QueryResponse<T, R>>;
export type QueryInfo<T extends Typenames, P, R> = Partial<Defaults> & {
    query: Query<P, T, R>;
    /** Merges results before saving to the store. Default implementation is using the latest result. */
    mergeResults?: (oldResult: R | undefined, response: QueryResponse<T, R>, params: P | undefined, store: Store) => R;
    /**
     * Cache key is used for storing the query state and for performing a fetch when it changes. Queries with the same cache key share their state.
     * Default implementation uses `JSON.stringify` or `String()` depending on type.
     * It is recommended to override it when default implementation is not optimal or when keys in params object can be sorted in random order etc.
     * */
    getCacheKey?: (params?: P) => Key;
    /** Called after fetch finished either successfully or not. */
    onCompleted?: (response: QueryResponse<T, R> | undefined, error: unknown | undefined, params: P | undefined, store: Store) => void;
    /** Called after fetch finished without error. */
    onSuccess?: (response: QueryResponse<T, R>, params: P | undefined, store: Store) => void;
    /** Called after fetch finished with error. */
    onError?: (error: unknown, params: P | undefined, store: Store) => void;
};
export type QueryState<P, R> = MutationState<P, R> & {
    expiresAt?: number;
};
export type UseQueryOptions<T extends Typenames, QP, QR, QK extends keyof (QP & QR)> = {
    query: QK;
    params: QK extends keyof (QP | QR) ? QP[QK] : never;
    /** When true fetch is not performed. When switches to false fetch is performed depending on cache policy. */
    skip?: boolean;
} & Pick<QueryInfo<T, QK extends keyof (QP | QR) ? QP[QK] : never, QK extends keyof (QP | QR) ? QR[QK] : never>, 'cachePolicy' | 'secondsToLive' | 'mergeResults' | 'onCompleted' | 'onSuccess' | 'onError'>;
export type QueryOptions<T extends Typenames, QP, QR, QK extends keyof (QP & QR)> = Omit<UseQueryOptions<T, QP, QR, QK>, 'skip' | 'cachePolicy'> & {
    /** If set to true, query will run only if it is expired or result not yet cached. */
    onlyIfExpired?: boolean;
};
export type QueryCachePolicy = 'cache-first' | 'cache-and-fetch';
export type QueryResponse<T extends Typenames, R> = EntityChanges<T> & {
    result: R;
    /** If defined, overrides this value for query state, ignoring `secondsToLive`. */
    expiresAt?: number;
};
export type QueryResult<R> = {
    error?: unknown;
    cancelled?: true;
    result?: R;
};
export type Mutation<P, T extends Typenames = Typenames, R = unknown> = (
/** Mutation parameters */
params: P, 
/** Redux store */
store: Store, 
/** Signal is aborted for current mutation when the same mutation was called once again. */
abortSignal: AbortSignal) => Promise<MutationResponse<T, R>>;
export type MutationInfo<T extends Typenames, P, R> = Pick<QueryInfo<T, P, R>, 'onCompleted' | 'onSuccess' | 'onError'> & {
    mutation: Mutation<P, T, R>;
};
export type MutateOptions<T extends Typenames, MP, MR, MK extends keyof (MP & MR)> = Pick<MutationInfo<T, MK extends keyof (MP | MR) ? MP[MK] : never, MK extends keyof (MP | MR) ? MR[MK] : never>, 'onCompleted' | 'onSuccess' | 'onError'> & {
    mutation: MK;
    params: MK extends keyof (MP | MR) ? MP[MK] : never;
};
export type MutationResponse<T extends Typenames, R> = EntityChanges<T> & {
    result?: R;
};
export type MutationResult<R> = {
    error?: unknown;
    aborted?: true;
    result?: R;
};
export type MutationState<P, R> = {
    /** `true` when query or mutation is currently in progress. */
    loading: boolean;
    /** Result of the latest successfull response. */
    result?: R;
    /** Error of the latest response. */
    error?: Error;
    /** Parameters of the latest request. */
    params?: P;
};
