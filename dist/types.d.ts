import type { Store } from 'redux';
import type { Actions } from './createActions';
import type { ReduxCacheState } from './createCacheReducer';
import type { Selectors } from './createSelectors';
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
        [QK in keyof (QP & QR)]: QK extends keyof (QP | QR) ? QueryInfo<N, T, QP[QK], QR[QK], QP, QR, MP, MR> : never;
    };
    mutations: {
        [MK in keyof (MP & MR)]: MK extends keyof (MP | MR) ? MutationInfo<N, T, MP[MK], MR[MK], QP, QR, MP, MR> : never;
    };
    /** Default options for queries and mutations. */
    globals: Globals<N, T, QP, QR, MP, MR>;
    options: CacheOptions;
    /** Should return cache state from redux root state. Default implementation returns `state[name]`. */
    cacheStateSelector: (state: any) => ReduxCacheState<T, QP, QR, MP, MR>;
};
export type Globals<N extends string, T extends Typenames, QP, QR, MP, MR> = {
    /** Handles errors, not handled by onError from queries and mutations. @Default undefined. */
    onError?: (error: unknown, key: string, params: unknown, store: Store, actions: Actions<N, T, QP, QR, MP, MR>, selectors: Selectors<N, T, QP, QR, MP, MR>) => void;
    /** Query options. */
    queries: {
        /** Determines when useQuery fetch triggers should start fetching. Fetch is performed if function returns true.
         * Fetch triggers are: 1) mount 2) cache key change 3) skipFetch value change to false.
         * @Default FetchPolicy.NoCacheOrExpired */
        fetchPolicy: (expired: boolean, params: unknown, state: QueryState<unknown, unknown>, store: Store, selectors: Selectors<N, T, QP, QR, MP, MR>) => boolean;
        /** Disables any fetches when set to true. Triggers fetch when changed to false. @Default false */
        skipFetch: boolean;
        /** If set, this value updates expiresAt value of query state when query result is received. @Default undefined */
        secondsToLive?: number;
    };
};
export type CacheOptions = {
    /** Enables additional validation with logging to console.warn. Recommened to enable in dev/testing mode. @Default true in dev mode. */
    additionalValidation: boolean;
    /** Enables debug logs. @Default false */
    logsEnabled: boolean;
    /**
     * Enables deep comparison before merging entities to the state.
     * Re-rendering is a heavier operation than comparison, so disabling it can lead to performance drop.
     * Makes sense to disable only if merging equal results & entities to the state is a rare case.
     * @Default true
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
export type QueryInfo<N extends string, T extends Typenames = Typenames, P = unknown, R = unknown, QP = unknown, QR = unknown, MP = unknown, MR = unknown> = Partial<Pick<Globals<N, T, QP, QR, MP, MR>['queries'], 'skipFetch' | 'secondsToLive'>> & {
    query: NormalizedQuery<T, P, R>;
    /** Determines when useQuery fetch triggers should start fetching. Fetch is performed if function returns true.
     * Fetch triggers are: 1) mount 2) cache key change 3) skipFetch value change to false.
     * @Default FetchPolicy.NoCacheOrExpired */
    fetchPolicy?: (expired: boolean, params: P, queryState: QueryState<P, R>, store: Store, selectors: Selectors<N, T, QP, QR, MP, MR>) => boolean;
    /** Merges results before saving to the store. Default implementation is using the latest result. */
    mergeResults?: (oldResult: R | undefined, response: NormalizedQueryResponse<T, R>, params: P | undefined, store: Store, actions: Actions<N, T, QP, QR, MP, MR>, selectors: Selectors<N, T, QP, QR, MP, MR>) => R;
    /**
     * Cache key is used for storing the query state and for performing a fetch when it changes. Queries with the same cache key share their state.
     * Default implementation uses `String()` or `JSON.stringify` depending on type.
     * It is recommended to override it when default implementation is not optimal or when keys in params object can be sorted in random order etc.
     */
    getCacheKey?: (params?: P) => Key;
    /** Called after fetch completed either successfully or not. */
    onCompleted?: (response: NormalizedQueryResponse<T, R> | undefined, error: unknown | undefined, params: P | undefined, store: Store, actions: Actions<N, T, QP, QR, MP, MR>, selectors: Selectors<N, T, QP, QR, MP, MR>) => void;
    /** Called after fetch finished successfully. */
    onSuccess?: (response: NormalizedQueryResponse<T, R>, params: P | undefined, store: Store, actions: Actions<N, T, QP, QR, MP, MR>, selectors: Selectors<N, T, QP, QR, MP, MR>) => void;
    /** Called after fetch finished with error. Should return true if error was handled and does not require global onError handling. */
    onError?: (error: unknown, params: P | undefined, store: Store, actions: Actions<N, T, QP, QR, MP, MR>, selectors: Selectors<N, T, QP, QR, MP, MR>) => boolean | void | null | undefined;
};
export type Query<P = unknown, R = unknown> = (
/** Query parameters */
params: P, 
/** Redux store */
store: Store) => Promise<QueryResponse<R>>;
export type NormalizedQuery<T extends Typenames = Typenames, P = unknown, R = unknown> = (...args: Parameters<Query<P, R>>) => Promise<NormalizedQueryResponse<T, R>>;
export type QueryState<P, R> = MutationState<P, R> & {
    expiresAt?: number;
};
export type UseQueryOptions<N extends string, T extends Typenames, QK extends keyof (QP & QR), QP, QR, MP, MR> = {
    query: QK;
    params: QK extends keyof (QP | QR) ? QP[QK] : never;
} & Pick<QueryInfo<N, T, QK extends keyof (QP | QR) ? QP[QK] : never, QK extends keyof (QP | QR) ? QR[QK] : never, QP, QR, MP, MR>, 'fetchPolicy' | 'skipFetch' | 'secondsToLive' | 'mergeResults' | 'onCompleted' | 'onSuccess' | 'onError'>;
export type QueryOptions<N extends string, T extends Typenames, QP, QR, QK extends keyof (QP & QR), MP, MR> = Omit<UseQueryOptions<N, T, QK, QP, QR, MP, MR>, 'skipFetch'> & {
    /** If set to true, query will run only if it is expired or result not yet cached. */
    onlyIfExpired?: boolean;
};
export type QueryResponse<R = unknown> = {
    result: R;
    /** If defined, overrides this value for query state, ignoring `secondsToLive`. */
    expiresAt?: number;
};
export type NormalizedQueryResponse<T extends Typenames = Typenames, R = unknown> = EntityChanges<T> & QueryResponse<R>;
export type QueryResult<R = unknown> = {
    error?: unknown;
    cancelled?: true;
    result?: R;
};
export type MutationInfo<N extends string, T extends Typenames = Typenames, P = unknown, R = unknown, QP = unknown, QR = unknown, MP = unknown, MR = unknown> = Pick<QueryInfo<N, T, P, R, QP, QR, MP, MR>, 'onCompleted' | 'onSuccess' | 'onError'> & {
    mutation: NormalizedMutation<T, P, R>;
};
export type Mutation<P = unknown, R = unknown> = (
/** Mutation parameters */
params: P, 
/** Redux store */
store: Store, 
/** Signal is aborted for current mutation when the same mutation was called once again. */
abortSignal: AbortSignal) => Promise<MutationResponse<R>>;
export type NormalizedMutation<T extends Typenames = Typenames, P = unknown, R = unknown> = (...args: Parameters<Mutation<P, R>>) => Promise<NormalizedMutationResponse<T, R>>;
export type MutateOptions<N extends string, T extends Typenames, QP, QR, MP, MR, MK extends keyof (MP & MR)> = Pick<MutationInfo<N, T, MK extends keyof (MP | MR) ? MP[MK] : never, MK extends keyof (MP | MR) ? MR[MK] : never, QP, QR, MP, MR>, 'onCompleted' | 'onSuccess' | 'onError'> & {
    mutation: MK;
    params: MK extends keyof (MP | MR) ? MP[MK] : never;
};
export type MutationResponse<R = unknown> = {
    result?: R;
};
export type NormalizedMutationResponse<T extends Typenames = Typenames, R = unknown> = EntityChanges<T> & MutationResponse<R>;
export type MutationResult<R = unknown> = {
    error?: unknown;
    aborted?: true;
    result?: R;
};
export type MutationState<P, R> = {
    /** `true` when fetch is currently in progress. */
    loading?: boolean;
    /** Result of the latest successfull response. */
    result?: R;
    /** Error of the latest response. */
    error?: Error;
    /** Parameters of the latest request. */
    params?: P;
};
