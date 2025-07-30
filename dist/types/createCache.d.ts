import type {
  Cache,
  CacheOptions,
  CacheState,
  Dict,
  EntitiesMap,
  EntityChanges,
  Globals,
  Key,
  MutateOptions,
  MutationInfo,
  MutationResult,
  MutationState,
  NormalizedQueryResponse,
  OptionalPartial,
  QueryInfo,
  QueryOptions,
  QueryResult,
  QueryState,
  Store,
  Typenames,
  UseQueryOptions,
} from './types'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'
import {applyEntityChanges} from './utilsAndConstants'

/**
 * Function to provide generic Typenames if normalization is needed - this is a Typescript limitation.
 * Returns object with createCache function with provided typenames.
 * @example
 * `const cache = withTypenames<MyTypenames>().createCache({...})`
 */
export declare const withTypenames: <T extends Typenames = Typenames>() => {
  /** Creates reducer, actions and hooks for managing queries and mutations through redux cache. */
  createCache: <N extends string, QP, QR, MP, MR>(
    partialCache: OptionalPartial<
      Omit<Cache<N, T, QP, QR, MP, MR>, 'globals'>,
      'options' | 'queries' | 'mutations' | 'cacheStateSelector' | 'storeHooks'
    > & {
      globals?: OptionalPartial<Cache<N, T, QP, QR, MP, MR>['globals'], 'queries'>
    }
  ) => {
    /** Keeps all options, passed while creating the cache. */
    cache: Cache<N, T, QP, QR, MP, MR>
    /** Reducer of the cache, should be added to redux store. */
    reducer: (
      state: CacheState<T, QP, QR, MP, MR> | undefined,
      action:
        | {
            type: `@rrc/${N}/updateQueryStateAndEntities`
            queryKey: keyof QP & keyof QR
            queryCacheKey: Key
            state: Partial<QueryState<T, QP[keyof QP & keyof QR], QR[keyof QP & keyof QR]>> | undefined
            entityChanges: EntityChanges<T> | undefined
          }
        | {
            type: `@rrc/${N}/updateMutationStateAndEntities`
            mutationKey: keyof MP & keyof MR
            state: Partial<MutationState<T, MP[keyof MP & keyof MR], MR[keyof MP & keyof MR]>> | undefined
            entityChanges: EntityChanges<T> | undefined
          }
        | {
            type: `@rrc/${N}/mergeEntityChanges`
            changes: EntityChanges<T>
          }
        | {
            type: `@rrc/${N}/invalidateQuery`
            queries: {
              query: keyof QP & keyof QR
              cacheKey?: Key
              expiresAt?: number
            }[]
          }
        | {
            type: `@rrc/${N}/clearQueryState`
            queries: {
              query: keyof QP & keyof QR
              cacheKey?: Key
            }[]
          }
        | {
            type: `@rrc/${N}/clearMutationState`
            mutationKeys: (keyof MP & keyof MR)[]
          }
        | {
            type: `@rrc/${N}/clearCache`
            stateToKeep: Partial<CacheState<T, QP, QR, MP, MR>> | undefined
          }
    ) => CacheState<T, QP, QR, MP, MR>
    actions: {
      /** Updates query state, and optionally merges entity changes in a single action. */
      updateQueryStateAndEntities: {
        <K extends keyof QP & keyof QR>(
          queryKey: K,
          queryCacheKey: Key,
          state?: Partial<QueryState<T, QP[K], QR[K]>> | undefined,
          entityChanges?: EntityChanges<T> | undefined
        ): {
          type: `@rrc/${N}/updateQueryStateAndEntities`
          queryKey: K
          queryCacheKey: Key
          state: Partial<QueryState<T, QP[K], QR[K]>> | undefined
          entityChanges: EntityChanges<T> | undefined
        }
        type: `@rrc/${N}/updateQueryStateAndEntities`
      }
      /** Updates mutation state, and optionally merges entity changes in a single action. */
      updateMutationStateAndEntities: {
        <K extends keyof MP & keyof MR>(
          mutationKey: K,
          state?: Partial<MutationState<T, MP[K], MR[K]>> | undefined,
          entityChanges?: EntityChanges<T> | undefined
        ): {
          type: `@rrc/${N}/updateMutationStateAndEntities`
          mutationKey: K
          state: Partial<MutationState<T, MP[K], MR[K]>> | undefined
          entityChanges: EntityChanges<T> | undefined
        }
        type: `@rrc/${N}/updateMutationStateAndEntities`
      }
      /** Merges EntityChanges to the state. */
      mergeEntityChanges: {
        (changes: EntityChanges<T>): {
          type: `@rrc/${N}/mergeEntityChanges`
          changes: EntityChanges<T>
        }
        type: `@rrc/${N}/mergeEntityChanges`
      }
      /** Invalidates query states. */
      invalidateQuery: {
        <K extends keyof QP & keyof QR>(
          queries: {
            query: K
            cacheKey?: Key
            expiresAt?: number
          }[]
        ): {
          type: `@rrc/${N}/invalidateQuery`
          queries: {
            query: K
            cacheKey?: Key
            expiresAt?: number
          }[]
        }
        type: `@rrc/${N}/invalidateQuery`
      }
      /** Clears states for provided query keys and cache keys.
       * If cache key for query key is not provided, the whole state for query key is cleared. */
      clearQueryState: {
        <K extends keyof QP & keyof QR>(
          queries: {
            query: K
            cacheKey?: Key
          }[]
        ): {
          type: `@rrc/${N}/clearQueryState`
          queries: {
            query: K
            cacheKey?: Key
          }[]
        }
        type: `@rrc/${N}/clearQueryState`
      }
      /** Clears states for provided mutation keys. */
      clearMutationState: {
        <K extends keyof MP & keyof MR>(mutationKeys: K[]): {
          type: `@rrc/${N}/clearMutationState`
          mutationKeys: K[]
        }
        type: `@rrc/${N}/clearMutationState`
      }
      /** Replaces cache state with initial, optionally merging with provided state. Doesn't cancel running fetches and shoult be used with caution. */
      clearCache: {
        (stateToKeep?: Partial<CacheState<T, QP, QR, MP, MR>> | undefined): {
          type: `@rrc/${N}/clearCache`
          stateToKeep: Partial<CacheState<T, QP, QR, MP, MR>> | undefined
        }
        type: `@rrc/${N}/clearCache`
      }
    }
    selectors: {
      /** This is a cacheStateSelector from createCache options, or default one if was not provided. */
      selectCacheState: (state: any) => CacheState<T, QP, QR, MP, MR>
      /** Selects query state. */
      selectQueryState: <QK extends keyof QP | keyof QR>(
        state: unknown,
        query: QK,
        cacheKey: Key
      ) => QueryState<
        T,
        QK extends keyof QP & keyof QR ? QP[QK] : never,
        QK extends keyof QP & keyof QR ? QR[QK] : never
      >
      /** Selects query latest result. */
      selectQueryResult: <QK extends keyof QP | keyof QR>(
        state: unknown,
        query: QK,
        cacheKey: Key
      ) => (QK extends keyof QP & keyof QR ? QR[QK] : never) | undefined
      /** Selects query loading state. */
      selectQueryLoading: <QK extends keyof QP | keyof QR>(
        state: unknown,
        query: QK,
        cacheKey: Key
      ) => false | Promise<NormalizedQueryResponse<T, QK extends keyof QP & keyof QR ? QR[QK] : never>>
      /** Selects query latest error. */
      selectQueryError: <QK extends keyof QP | keyof QR>(
        state: unknown,
        query: QK,
        cacheKey: Key
      ) => Error | undefined
      /** Selects query latest params. */
      selectQueryParams: <QK extends keyof QP | keyof QR>(
        state: unknown,
        query: QK,
        cacheKey: Key
      ) => (QK extends keyof QP & keyof QR ? QP[QK] : never) | undefined
      /** Selects query latest expiresAt. */
      selectQueryExpiresAt: <QK extends keyof QP | keyof QR>(
        state: unknown,
        query: QK,
        cacheKey: Key
      ) => number | undefined
      /** Selects mutation state. */
      selectMutationState: <MK extends keyof MP | keyof MR>(
        state: unknown,
        mutation: MK
      ) => MutationState<
        T,
        MK extends keyof MP & keyof MR ? MP[MK] : never,
        MK extends keyof MP & keyof MR ? MR[MK] : never
      >
      /** Selects mutation latest result. */
      selectMutationResult: <MK extends keyof MP | keyof MR>(
        state: unknown,
        mutation: MK
      ) => (MK extends keyof MP & keyof MR ? MR[MK] : never) | undefined
      /** Selects mutation loading state. */
      selectMutationLoading: <MK extends keyof MP | keyof MR>(
        state: unknown,
        mutation: MK
      ) => false | Promise<NormalizedQueryResponse<T, MK extends keyof MP & keyof MR ? MR[MK] : never>>
      /** Selects mutation latest error. */
      selectMutationError: <MK extends keyof MP | keyof MR>(state: unknown, mutation: MK) => Error | undefined
      /** Selects mutation latest params. */
      selectMutationParams: <MK extends keyof MP | keyof MR>(
        state: unknown,
        mutation: MK
      ) => (MK extends keyof MP & keyof MR ? MP[MK] : never) | undefined
      /** Selects entity by id and typename. */
      selectEntityById: <TN extends keyof T>(
        state: unknown,
        id: Key | null | undefined,
        typename: TN
      ) => T[TN] | undefined
      /** Selects all entities. */
      selectEntities: (state: unknown) => EntitiesMap<T>
      /** Selects all entities of provided typename. */
      selectEntitiesByTypename: <TN extends keyof T>(state: unknown, typename: TN) => EntitiesMap<T>[TN]
    }
    hooks: {
      /** Returns memoized object with query and mutate functions. Memoization dependency is the store. */
      useClient: () => {
        /**
         * Performs a query using provided options. Deduplicates calls with the same cache key. Always returns current cached result, even when query is cancelled or finished with error.
         * @param onlyIfExpired When true, cancels fetch if result is not yet expired.
         * @param skipFetch Fetch is cancelled and current cached result is returned.
         */
        query: <QK extends keyof (QP & QR)>(
          options: QueryOptions<N, T, QP, QR, QK, MP, MR>
        ) => Promise<QueryResult<QK extends keyof QP & keyof QR ? QR[QK] : never>>
        /**
         * Performs a mutation, aborting previous one with the same mutation key. Returns result only if finished succesfully.
         */
        mutate: <MK extends keyof (MP & MR)>(
          options: MutateOptions<N, T, QP, QR, MP, MR, MK>
        ) => Promise<MutationResult<MK extends keyof MP & keyof MR ? MR[MK] : never>>
      }
      /** Fetches query when params change and subscribes to query state changes (subscription depends on `selectorComparer`). */
      useQuery: <QK extends keyof (QP & QR)>(
        options: Parameters<typeof useQuery<N, T, QP, QR, MP, MR, QK>>[3]
      ) => readonly [
        Omit<
          QueryState<
            T,
            QK extends keyof QP & keyof QR ? QP[QK] : never,
            QK extends keyof QP & keyof QR ? QR[QK] : never
          >,
          'expiresAt'
        >,
        (
          options?:
            | Partial<Pick<QueryOptions<N, T, QP, QR, QK, MP, MR>, 'params' | 'onlyIfExpired'>>
            | undefined
        ) => Promise<
          QueryResult<
            QK extends infer T_1
              ? T_1 extends QK
                ? T_1 extends keyof QP & keyof QR
                  ? QR[T_1]
                  : never
                : never
              : never
          >
        >
      ]
      /** Subscribes to provided mutation state and provides mutate function. */
      useMutation: <MK extends keyof (MP & MR)>(
        options: Parameters<typeof useMutation<N, T, QP, QR, MP, MR, MK>>[3]
      ) => readonly [
        (
          params: MK extends keyof MP & keyof MR ? MP[MK] : never
        ) => Promise<
          MutationResult<
            MK extends infer T_1
              ? T_1 extends MK
                ? T_1 extends keyof MP & keyof MR
                  ? MR[T_1]
                  : never
                : never
              : never
          >
        >,
        MutationState<
          T,
          MK extends keyof MP & keyof MR ? MP[MK] : never,
          MK extends keyof MP & keyof MR ? MP[MK] : never
        >,
        () => boolean
      ]
      /** useSelector + selectEntityById. */
      useSelectEntityById: <TN extends keyof T>(id: Key | null | undefined, typename: TN) => T[TN] | undefined
    }
    utils: {
      /** Creates client by providing the store. Can be used when the store is a singleton - to not use a useClient hook for getting the client, but import it directly. */
      createClient: (store: Store) => {
        /**
         * Performs a query using provided options. Deduplicates calls with the same cache key. Always returns current cached result, even when query is cancelled or finished with error.
         * @param onlyIfExpired When true, cancels fetch if result is not yet expired.
         * @param skipFetch Fetch is cancelled and current cached result is returned.
         */
        query: <QK extends keyof (QP & QR)>(
          options: QueryOptions<N, T, QP, QR, QK, MP, MR>
        ) => Promise<QueryResult<QK extends keyof QP & keyof QR ? QR[QK] : never>>
        /**
         * Performs a mutation, aborting previous one with the same mutation key. Returns result only if finished succesfully.
         */
        mutate: <MK extends keyof (MP & MR)>(
          options: MutateOptions<N, T, QP, QR, MP, MR, MK>
        ) => Promise<MutationResult<MK extends keyof MP & keyof MR ? MR[MK] : never>>
      }
      /** Generates the initial state by calling a reducer. Not needed for redux — it already generates it the same way when creating the store. */
      getInitialState: () => CacheState<T, QP, QR, MP, MR>
      /** Apply changes to the entities map.
       * @returns `undefined` if nothing to change, otherwise new `EntitiesMap<T>` with applied changes. */
      applyEntityChanges: (
        entities: Parameters<typeof applyEntityChanges<T>>[0],
        changes: Parameters<typeof applyEntityChanges<T>>[1]
      ) => EntitiesMap<T> | undefined
    }
  }
}

/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
export declare const createCache: <N extends string, QP, QR, MP, MR>(
  partialCache: Partial<{
    queries: Partial<{
      [QK in keyof (QP & QR)]: QK extends keyof QP & keyof QR
        ? QueryInfo<N, Typenames, QP[QK], QR[QK], QP, QR, MP, MR>
        : never
    }>
    mutations: Partial<{
      [MK in keyof (MP & MR)]: MK extends keyof MP & keyof MR
        ? MutationInfo<N, Typenames, MP[MK], MR[MK], QP, QR, MP, MR>
        : never
    }>
    options: Partial<CacheOptions>
    storeHooks: Partial<{
      useStore: () => Store
      useSelector: <R>(selector: (state: unknown) => R, comparer?: (x: R, y: R) => boolean) => R
    }>
    cacheStateSelector: Partial<(state: any) => CacheState<Typenames, QP, QR, MP, MR>>
  }> &
    Omit<
      Omit<Cache<N, Typenames, QP, QR, MP, MR>, 'globals'>,
      'queries' | 'mutations' | 'options' | 'storeHooks' | 'cacheStateSelector'
    > & {
      globals?: OptionalPartial<Globals<N, Typenames, QP, QR, MP, MR>, 'queries'> | undefined
    }
) => {
  /** Keeps all options, passed while creating the cache. */
  cache: Cache<N, Typenames, QP, QR, MP, MR>
  /** Reducer of the cache, should be added to redux store. */
  reducer: (
    state: CacheState<Typenames, QP, QR, MP, MR> | undefined,
    action:
      | {
          type: `@rrc/${N}/updateQueryStateAndEntities`
          queryKey: keyof QP & keyof QR
          queryCacheKey: Key
          state: Partial<QueryState<Typenames, QP[keyof QP & keyof QR], QR[keyof QP & keyof QR]>> | undefined
          entityChanges: EntityChanges<Typenames> | undefined
        }
      | {
          type: `@rrc/${N}/updateMutationStateAndEntities`
          mutationKey: keyof MP & keyof MR
          state:
            | Partial<MutationState<Typenames, MP[keyof MP & keyof MR], MR[keyof MP & keyof MR]>>
            | undefined
          entityChanges: EntityChanges<Typenames> | undefined
        }
      | {
          type: `@rrc/${N}/mergeEntityChanges`
          changes: EntityChanges<Typenames>
        }
      | {
          type: `@rrc/${N}/invalidateQuery`
          queries: {
            query: keyof QP & keyof QR
            cacheKey?: Key
            expiresAt?: number
          }[]
        }
      | {
          type: `@rrc/${N}/clearQueryState`
          queries: {
            query: keyof QP & keyof QR
            cacheKey?: Key
          }[]
        }
      | {
          type: `@rrc/${N}/clearMutationState`
          mutationKeys: (keyof MP & keyof MR)[]
        }
      | {
          type: `@rrc/${N}/clearCache`
          stateToKeep: Partial<CacheState<Typenames, QP, QR, MP, MR>> | undefined
        }
  ) => CacheState<Typenames, QP, QR, MP, MR>
  actions: {
    /** Updates query state, and optionally merges entity changes in a single action. */
    updateQueryStateAndEntities: {
      <K extends keyof QP & keyof QR>(
        queryKey: K,
        queryCacheKey: Key,
        state?: Partial<QueryState<Typenames, QP[K], QR[K]>> | undefined,
        entityChanges?: EntityChanges<Typenames> | undefined
      ): {
        type: `@rrc/${N}/updateQueryStateAndEntities`
        queryKey: K
        queryCacheKey: Key
        state: Partial<QueryState<Typenames, QP[K], QR[K]>> | undefined
        entityChanges: EntityChanges<Typenames> | undefined
      }
      type: `@rrc/${N}/updateQueryStateAndEntities`
    }
    /** Updates mutation state, and optionally merges entity changes in a single action. */
    updateMutationStateAndEntities: {
      <K extends keyof MP & keyof MR>(
        mutationKey: K,
        state?: Partial<MutationState<Typenames, MP[K], MR[K]>> | undefined,
        entityChanges?: EntityChanges<Typenames> | undefined
      ): {
        type: `@rrc/${N}/updateMutationStateAndEntities`
        mutationKey: K
        state: Partial<MutationState<Typenames, MP[K], MR[K]>> | undefined
        entityChanges: EntityChanges<Typenames> | undefined
      }
      type: `@rrc/${N}/updateMutationStateAndEntities`
    }
    /** Merges EntityChanges to the state. */
    mergeEntityChanges: {
      (changes: EntityChanges<Typenames>): {
        type: `@rrc/${N}/mergeEntityChanges`
        changes: EntityChanges<Typenames>
      }
      type: `@rrc/${N}/mergeEntityChanges`
    }
    /** Invalidates query states. */
    invalidateQuery: {
      <K extends keyof QP & keyof QR>(
        queries: {
          query: K
          cacheKey?: Key
          expiresAt?: number
        }[]
      ): {
        type: `@rrc/${N}/invalidateQuery`
        queries: {
          query: K
          cacheKey?: Key
          expiresAt?: number
        }[]
      }
      type: `@rrc/${N}/invalidateQuery`
    }
    /** Clears states for provided query keys and cache keys.
     * If cache key for query key is not provided, the whole state for query key is cleared. */
    clearQueryState: {
      <K extends keyof QP & keyof QR>(
        queries: {
          query: K
          cacheKey?: Key
        }[]
      ): {
        type: `@rrc/${N}/clearQueryState`
        queries: {
          query: K
          cacheKey?: Key
        }[]
      }
      type: `@rrc/${N}/clearQueryState`
    }
    /** Clears states for provided mutation keys. */
    clearMutationState: {
      <K extends keyof MP & keyof MR>(mutationKeys: K[]): {
        type: `@rrc/${N}/clearMutationState`
        mutationKeys: K[]
      }
      type: `@rrc/${N}/clearMutationState`
    }
    /** Replaces cache state with initial, optionally merging with provided state. Doesn't cancel running fetches and shoult be used with caution. */
    clearCache: {
      (stateToKeep?: Partial<CacheState<Typenames, QP, QR, MP, MR>> | undefined): {
        type: `@rrc/${N}/clearCache`
        stateToKeep: Partial<CacheState<Typenames, QP, QR, MP, MR>> | undefined
      }
      type: `@rrc/${N}/clearCache`
    }
  }
  selectors: {
    /** This is a cacheStateSelector from createCache options, or default one if was not provided. */
    selectCacheState: (state: any) => CacheState<Typenames, QP, QR, MP, MR>
    /** Selects query state. */
    selectQueryState: <QK_1 extends keyof QP | keyof QR>(
      state: unknown,
      query: QK_1,
      cacheKey: Key
    ) => QueryState<
      Typenames,
      QK_1 extends keyof QP & keyof QR ? QP[QK_1] : never,
      QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never
    >
    /** Selects query latest result. */
    selectQueryResult: <QK_1 extends keyof QP | keyof QR>(
      state: unknown,
      query: QK_1,
      cacheKey: Key
    ) => (QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never) | undefined
    /** Selects query loading state. */
    selectQueryLoading: <QK_1 extends keyof QP | keyof QR>(
      state: unknown,
      query: QK_1,
      cacheKey: Key
    ) =>
      | false
      | Promise<NormalizedQueryResponse<Typenames, QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never>>
    /** Selects query latest error. */
    selectQueryError: <QK_1 extends keyof QP | keyof QR>(
      state: unknown,
      query: QK_1,
      cacheKey: Key
    ) => Error | undefined
    /** Selects query latest params. */
    selectQueryParams: <QK_1 extends keyof QP | keyof QR>(
      state: unknown,
      query: QK_1,
      cacheKey: Key
    ) => (QK_1 extends keyof QP & keyof QR ? QP[QK_1] : never) | undefined
    /** Selects query latest expiresAt. */
    selectQueryExpiresAt: <QK_1 extends keyof QP | keyof QR>(
      state: unknown,
      query: QK_1,
      cacheKey: Key
    ) => number | undefined
    /** Selects mutation state. */
    selectMutationState: <MK_1 extends keyof MP | keyof MR>(
      state: unknown,
      mutation: MK_1
    ) => MutationState<
      Typenames,
      MK_1 extends keyof MP & keyof MR ? MP[MK_1] : never,
      MK_1 extends keyof MP & keyof MR ? MR[MK_1] : never
    >
    /** Selects mutation latest result. */
    selectMutationResult: <MK_1 extends keyof MP | keyof MR>(
      state: unknown,
      mutation: MK_1
    ) => (MK_1 extends keyof MP & keyof MR ? MR[MK_1] : never) | undefined
    /** Selects mutation loading state. */
    selectMutationLoading: <MK_1 extends keyof MP | keyof MR>(
      state: unknown,
      mutation: MK_1
    ) =>
      | false
      | Promise<NormalizedQueryResponse<Typenames, MK_1 extends keyof MP & keyof MR ? MR[MK_1] : never>>
    /** Selects mutation latest error. */
    selectMutationError: <MK_1 extends keyof MP | keyof MR>(
      state: unknown,
      mutation: MK_1
    ) => Error | undefined
    /** Selects mutation latest params. */
    selectMutationParams: <MK_1 extends keyof MP | keyof MR>(
      state: unknown,
      mutation: MK_1
    ) => (MK_1 extends keyof MP & keyof MR ? MP[MK_1] : never) | undefined
    /** Selects entity by id and typename. */
    selectEntityById: <TN extends string>(
      state: unknown,
      id: Key | null | undefined,
      typename: TN
    ) => object | undefined
    /** Selects all entities. */
    selectEntities: (state: unknown) => EntitiesMap<Typenames>
    /** Selects all entities of provided typename. */
    selectEntitiesByTypename: <TN extends string>(state: unknown, typename: TN) => Dict<object> | undefined
  }
  hooks: {
    /** Returns memoized object with query and mutate functions. Memoization dependency is the store. */
    useClient: () => {
      /**
       * Performs a query using provided options. Deduplicates calls with the same cache key. Always returns current cached result, even when query is cancelled or finished with error.
       * @param onlyIfExpired When true, cancels fetch if result is not yet expired.
       * @param skipFetch Fetch is cancelled and current cached result is returned.
       */
      query: <QK_1 extends keyof QP | keyof QR>(
        options: QueryOptions<N, Typenames, QP, QR, QK_1, MP, MR>
      ) => Promise<QueryResult<QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never>>
      /**
       * Performs a mutation, aborting previous one with the same mutation key. Returns result only if finished succesfully.
       */
      mutate: <MK_1 extends keyof MP | keyof MR>(
        options: MutateOptions<N, Typenames, QP, QR, MP, MR, MK_1>
      ) => Promise<MutationResult<MK_1 extends keyof MP & keyof MR ? MR[MK_1] : never>>
    }
    /** Fetches query when params change and subscribes to query state changes (subscription depends on `selectorComparer`). */
    useQuery: <QK_1 extends keyof QP | keyof QR>(
      options: UseQueryOptions<N, Typenames, QK_1, QP, QR, MP, MR>
    ) => readonly [
      Omit<
        QueryState<
          Typenames,
          QK_1 extends keyof QP & keyof QR ? QP[QK_1] : never,
          QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never
        >,
        'expiresAt'
      >,
      (
        options?:
          | Partial<Pick<QueryOptions<N, Typenames, QP, QR, QK_1, MP, MR>, 'params' | 'onlyIfExpired'>>
          | undefined
      ) => Promise<
        QueryResult<
          QK_1 extends infer T
            ? T extends QK_1
              ? T extends keyof QP & keyof QR
                ? QR[T]
                : never
              : never
            : never
        >
      >
    ]
    /** Subscribes to provided mutation state and provides mutate function. */
    useMutation: <MK_1 extends keyof MP | keyof MR>(
      options: Omit<MutateOptions<N, Typenames, QP, QR, MP, MR, MK_1>, 'params'>
    ) => readonly [
      (
        params: MK_1 extends keyof MP & keyof MR ? MP[MK_1] : never
      ) => Promise<
        MutationResult<
          MK_1 extends infer T
            ? T extends MK_1
              ? T extends keyof MP & keyof MR
                ? MR[T]
                : never
              : never
            : never
        >
      >,
      MutationState<
        Typenames,
        MK_1 extends keyof MP & keyof MR ? MP[MK_1] : never,
        MK_1 extends keyof MP & keyof MR ? MP[MK_1] : never
      >,
      () => boolean
    ]
    /** useSelector + selectEntityById. */
    useSelectEntityById: <TN extends string>(id: Key | null | undefined, typename: TN) => object | undefined
  }
  utils: {
    /** Creates client by providing the store. Can be used when the store is a singleton - to not use a useClient hook for getting the client, but import it directly. */
    createClient: (store: Store) => {
      /**
       * Performs a query using provided options. Deduplicates calls with the same cache key. Always returns current cached result, even when query is cancelled or finished with error.
       * @param onlyIfExpired When true, cancels fetch if result is not yet expired.
       * @param skipFetch Fetch is cancelled and current cached result is returned.
       */
      query: <QK_1 extends keyof QP | keyof QR>(
        options: QueryOptions<N, Typenames, QP, QR, QK_1, MP, MR>
      ) => Promise<QueryResult<QK_1 extends keyof QP & keyof QR ? QR[QK_1] : never>>
      /**
       * Performs a mutation, aborting previous one with the same mutation key. Returns result only if finished succesfully.
       */
      mutate: <MK_1 extends keyof MP | keyof MR>(
        options: MutateOptions<N, Typenames, QP, QR, MP, MR, MK_1>
      ) => Promise<MutationResult<MK_1 extends keyof MP & keyof MR ? MR[MK_1] : never>>
    }
    /** Generates the initial state by calling a reducer. Not needed for redux — it already generates it the same way when creating the store. */
    getInitialState: () => CacheState<Typenames, QP, QR, MP, MR>
    /** Apply changes to the entities map.
     * @returns `undefined` if nothing to change, otherwise new `EntitiesMap<T>` with applied changes. */
    applyEntityChanges: (
      entities: EntitiesMap<Typenames>,
      changes: EntityChanges<Typenames>
    ) => EntitiesMap<Typenames> | undefined
  }
}
