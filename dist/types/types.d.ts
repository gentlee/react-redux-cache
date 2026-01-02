import type {Actions} from './createActions'
import type {Selectors} from './createSelectors'

export type Key = string | number | symbol

export type Mutable = {
  /**
   * Used only when mutable cache enabled. Always incremented when collection changed by reducer to allow subscribe on changes.
   * Should not be used for comparing different collections as supposed to be compared only with previously saved changeKey of the same collection.
   */
  _changeKey?: number
}

export type Dict<T> = Record<Key, T> & Mutable

export type OptionalPartial<T, K extends keyof T> = Partial<{
  [A in K]: Partial<T[A]>
}> &
  Omit<T, K>

/** Entity changes to be merged to the state. */
export type EntityChanges<T extends Typenames> = {
  /** Entities that will be merged with existing. */
  merge?: PartialEntitiesMap<T>
  /** Entities that will replace existing. */
  replace?: Partial<EntitiesMap<T>>
  /** Ids of entities that will be removed. */
  remove?: EntityIds<T>
  /** Alias for `merge` to support normalizr. */
  entities?: EntityChanges<T>['merge']
}

export type Store<S = unknown> = {
  dispatch: (action: ReturnType<Actions[keyof Actions]>) => unknown
  getState: () => S
}

/** Record of typename and its corresponding entity type */
export type Typenames = Record<string, object>

export type Cache<N extends string, T extends Typenames, QP, QR, MP, MR> = {
  /** Used as prefix for actions and in default cacheStateSelector for selecting cache state from store root state. */
  name: N
  /** Cache options. */
  options: CacheOptions
  /** Default options for queries and mutations. */
  globals: Globals<N, T, QP, QR, MP, MR>
  /** Hooks to access and subscribe to the store. Imported from react-redux if not overridden. */
  storeHooks: {
    useStore: () => Store
    useSelector: <R>(selector: (state: unknown) => R, comparer?: (x: R, y: R) => boolean) => R
  }
  /** Should return cache state from store root state. Default implementation returns `state[name]`. */
  cacheStateSelector: (state: any) => CacheState<T, QP, QR, MP, MR>
  /** Queries. */
  queries: {
    [QK in keyof (QP & QR)]: QK extends keyof (QP | QR)
      ? QueryInfo<N, T, QP[QK], QR[QK], QP, QR, MP, MR>
      : never
  }
  /** Mutations. */
  mutations: {
    [MK in keyof (MP & MR)]: MK extends keyof (MP | MR)
      ? MutationInfo<N, T, MP[MK], MR[MK], QP, QR, MP, MR>
      : never
  }
}

export type QueryStateComparer<T extends Typenames, P, R> = (
  x: QueryState<T, P, R> | undefined,
  y: QueryState<T, P, R> | undefined
) => boolean

export type Globals<N extends string, T extends Typenames, QP, QR, MP, MR> = {
  /** Handles errors, not handled by onError from queries and mutations. @Default undefined. */
  onError?: (
    error: unknown,
    key: string,
    params: unknown,
    store: Store,
    actions: Actions<N, T, QP, QR, MP, MR>,
    selectors: Selectors<N, T, QP, QR, MP, MR>
  ) => void
  /** Query options. */
  queries: {
    /** Determines when useQuery fetch triggers should start fetching. Fetch is performed if function returns true.
     * Fetch triggers are: 1) mount 2) cache key change 3) skipFetch value change to false.
     * @Default FetchPolicy.NoCacheOrExpired */
    fetchPolicy: (
      expired: boolean,
      params: unknown,
      state: QueryState<T, unknown, unknown>,
      store: Store,
      selectors: Selectors<N, T, QP, QR, MP, MR>
    ) => boolean
    /** Disables any fetches when set to true. Triggers fetch when changed to false. @Default false */
    skipFetch: boolean
    /** If set, this value updates expiresAt value of query state when query result is received. @Default undefined */
    secondsToLive?: number
    /** Either comparer function, or array of keys to subscribe by useQuery's useSelector. @Default compares result, loading, params, error. */
    selectorComparer?: QueryStateComparer<T, unknown, unknown> | (keyof QueryState<T, unknown, unknown>)[]
  }
}

export type CacheOptions = {
  /**
   * BETA: Optimization that makes state collections mutable.
   * Collections still can be replaced with the new ones instead of mutating e.g. when clearing state,
   * so subscription will work only when subscribed to both collection and its change key.
   * @Default false
   * */
  mutableCollections: boolean
  /** Enables additional validation with logging to console.warn. Recommended to enable in dev/testing mode. @Default true in dev mode. */
  additionalValidation: boolean
  /** Enables debug logs. @Default false */
  logsEnabled: boolean
  /**
   * Enables deep comparison before merging entities to the state.
   * Re-rendering is a heavier operation than comparison, so disabling it can lead to performance drop.
   * Makes sense to disable only if merging equal results & entities to the state is a rare case.
   * @Default true
   */
  deepComparisonEnabled: boolean
}

export type PartialEntitiesMap<T extends Typenames> = {
  [K in keyof T]?: Dict<Partial<T[K]>>
}

export type EntitiesMap<T extends Typenames> = {
  [K in keyof T]?: Dict<T[K]>
}

export type EntityIds<T extends Typenames> = {
  [K in keyof T]?: Key[]
}

export type CacheState<T extends Typenames, QP, QR, MP, MR> = {
  entities: EntitiesMap<T> & Mutable
  queries: {
    [QK in keyof (QP | QR)]: Dict<QueryState<T, QP[QK], QR[QK]> | undefined>
  } & Mutable
  mutations: {
    [MK in keyof (MP | MR)]: MutationState<T, MP[MK], MR[MK]>
  } & Mutable
}

export type QueryInfo<
  N extends string,
  T extends Typenames = Typenames,
  P = unknown,
  R = unknown,
  QP = unknown,
  QR = unknown,
  MP = unknown,
  MR = unknown
> = Partial<Pick<Globals<N, T, QP, QR, MP, MR>['queries'], 'skipFetch' | 'secondsToLive'>> & {
  query: NormalizedQuery<T, P, R>
  /** Determines when useQuery fetch triggers should start fetching. Fetch is performed if function returns true.
   * Fetch triggers are: 1) mount 2) cache key change 3) skipFetch value change to false.
   * @Default FetchPolicy.NoCacheOrExpired */
  fetchPolicy?: (
    expired: boolean,
    params: P,
    queryState: QueryState<T, P, R>,
    store: Store,
    selectors: Selectors<N, T, QP, QR, MP, MR>
  ) => boolean
  /** Merges results before saving to the store. Default implementation is using the latest result. */
  mergeResults?: (
    oldResult: R | undefined,
    response: NormalizedQueryResponse<T, R>,
    params: P | undefined,
    store: Store,
    actions: Actions<N, T, QP, QR, MP, MR>,
    selectors: Selectors<N, T, QP, QR, MP, MR>
  ) => R
  /**
   * Cache key is used for storing the query state and for performing a fetch when it changes. Queries with the same cache key share their state.
   * Default implementation uses `String()` or `JSON.stringify` depending on type.
   * It is recommended to override it when default implementation is not optimal or when keys in params object can be sorted in random order etc.
   */
  getCacheKey?: (params: P) => Key
  /** Called after fetch completed either successfully or not. */
  onCompleted?: (
    response: NormalizedQueryResponse<T, R> | undefined,
    error: unknown | undefined,
    params: P | undefined,
    store: Store,
    actions: Actions<N, T, QP, QR, MP, MR>,
    selectors: Selectors<N, T, QP, QR, MP, MR>
  ) => void
  /** Called after fetch finished successfully. */
  onSuccess?: (
    response: NormalizedQueryResponse<T, R>,
    params: P | undefined,
    store: Store,
    actions: Actions<N, T, QP, QR, MP, MR>,
    selectors: Selectors<N, T, QP, QR, MP, MR>
  ) => void
  /** Called after fetch finished with error. Should return true if error was handled and does not require global onError handling. */
  onError?: (
    error: unknown,
    params: P | undefined,
    store: Store,
    actions: Actions<N, T, QP, QR, MP, MR>,
    selectors: Selectors<N, T, QP, QR, MP, MR>
  ) => boolean | void | null | undefined
  /** Either comparer function, or array of keys to subscribe by useQuery's useSelector. Default compares params, result, loading, error. */
  selectorComparer?: QueryStateComparer<T, P, R> | (keyof QueryState<T, P, R>)[]
}

export type Query<P = unknown, R = unknown> = (
  /** Query parameters */
  params: P,
  /** Store */
  store: Store
) => Promise<QueryResponse<R>>

export type NormalizedQuery<T extends Typenames = Typenames, P = unknown, R = unknown> = (
  ...args: Parameters<Query<P, R>>
) => Promise<NormalizedQueryResponse<T, R>>

export type QueryState<T extends Typenames, P, R> = MutationState<T, P, R> & {
  /**
   * Timestamp in milliseconds, after which state is considered expired.
   * Hooks may refetch the query again when component mounts, cache key or skip option change, depending on the fetch policy.
   * Client query calls also start making fetch if onlyIfExpired argument is truthy.
   * */
  expiresAt?: number
}

export type UseQueryOptions<
  N extends string,
  T extends Typenames,
  QK extends keyof (QP & QR),
  QP,
  QR,
  MP,
  MR
> = {
  query: QK
  params: QK extends keyof (QP | QR) ? QP[QK] : never
} & Pick<
  QueryInfo<
    N,
    T,
    QK extends keyof (QP | QR) ? QP[QK] : never,
    QK extends keyof (QP | QR) ? QR[QK] : never,
    QP,
    QR,
    MP,
    MR
  >,
  | 'fetchPolicy'
  | 'skipFetch'
  | 'secondsToLive'
  | 'selectorComparer'
  | 'mergeResults'
  | 'onCompleted'
  | 'onSuccess'
  | 'onError'
>

export type QueryOptions<
  N extends string,
  T extends Typenames,
  QP,
  QR,
  QK extends keyof (QP & QR),
  MP,
  MR
> = Pick<
  UseQueryOptions<N, T, QK, QP, QR, MP, MR>,
  | 'query'
  | 'params'
  | 'skipFetch'
  | 'secondsToLive'
  | 'mergeResults'
  | 'onCompleted'
  | 'onSuccess'
  | 'onError'
> & {
  /** If set to true, query will run only if it is expired or result not yet cached. */
  onlyIfExpired?: boolean
}

export type QueryResponse<R = unknown> = {
  result: R
  /** If defined, overrides this value in the query state, ignoring `secondsToLive` option. */
  expiresAt?: number
}

export type NormalizedQueryResponse<T extends Typenames = Typenames, R = unknown> = EntityChanges<T> &
  QueryResponse<R>

/** Result is always returned, even if cancelled or finished with error. */
export type QueryResult<R = unknown> = {
  error?: unknown
  /**
   * Fetch cancelled reason.
   * @value loading - already loading. Result of current fetch is returned.
   * @value not-expired - not expired yet. Current state result is returned.
   */
  cancelled?: 'loading' | 'not-expired'
  result?: R
}

export type MutationInfo<
  N extends string,
  T extends Typenames = Typenames,
  P = unknown,
  R = unknown,
  QP = unknown,
  QR = unknown,
  MP = unknown,
  MR = unknown
> = Pick<QueryInfo<N, T, P, R, QP, QR, MP, MR>, 'onCompleted' | 'onSuccess' | 'onError'> & {
  mutation: NormalizedMutation<T, P, R>
}

export type Mutation<P = unknown, R = unknown> = (
  /** Mutation parameters */
  params: P,
  /** Store */
  store: Store,
  /** Signal is aborted for current mutation when the same mutation was called once again. */
  abortSignal: AbortSignal
) => Promise<MutationResponse<R>>

export type NormalizedMutation<T extends Typenames = Typenames, P = unknown, R = unknown> = (
  ...args: Parameters<Mutation<P, R>>
) => Promise<NormalizedMutationResponse<T, R>>

export type MutateOptions<
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  MK extends keyof (MP & MR)
> = Pick<
  MutationInfo<
    N,
    T,
    MK extends keyof (MP | MR) ? MP[MK] : never,
    MK extends keyof (MP | MR) ? MR[MK] : never,
    QP,
    QR,
    MP,
    MR
  >,
  'onCompleted' | 'onSuccess' | 'onError'
> & {
  mutation: MK
  params: MK extends keyof (MP | MR) ? MP[MK] : never
}

export type MutationResponse<R = unknown> = {
  result?: R
}

export type NormalizedMutationResponse<T extends Typenames = Typenames, R = unknown> = EntityChanges<T> &
  MutationResponse<R>

export type MutationResult<R = unknown> = {
  error?: unknown
  aborted?: true
  result?: R
}

export type MutationState<T extends Typenames, P, R> = {
  /** Set when fetch is currently in progress. */
  loading?: Promise<NormalizedQueryResponse<T, R>>
  /** Result of the latest successfull response. */
  result?: R
  /** Error of the latest response. */
  error?: Error
  /** Parameters of the latest request. */
  params?: P
}
