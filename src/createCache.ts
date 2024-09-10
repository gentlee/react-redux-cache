import {useMemo} from 'react'
import {useStore} from 'react-redux'
import {Store} from 'redux'

import {createActions} from './createActions'
import {mutate as mutateImpl} from './mutate'
import {query as queryImpl} from './query'
import {createCacheReducer} from './reducer'
import type {
  Cache,
  CacheOptions,
  Key,
  MutationResult,
  OptionalPartial,
  QueryMutationState,
  QueryOptions,
  QueryResult,
  Typenames,
} from './types'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'
import {applyEntityChanges, defaultGetCacheKey, IS_DEV} from './utilsAndConstants'

/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
export const createCache = <N extends string, T extends Typenames, QP, QR, MP, MR>(
  partialCache: OptionalPartial<
    Cache<N, T, QP, QR, MP, MR>,
    'options' | 'queries' | 'mutations' | 'cacheStateSelector'
  >
) => {
  type TypedCache = Cache<N, T, QP, QR, MP, MR>

  const abortControllers = new WeakMap<Store, Record<Key, AbortController>>()

  // provide all optional fields

  partialCache.options ??= {} as CacheOptions
  partialCache.options.logsEnabled ??= false
  partialCache.options.validateFunctionArguments ??= IS_DEV
  partialCache.queries ??= {} as TypedCache['queries']
  partialCache.mutations ??= {} as TypedCache['mutations']
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  partialCache.cacheStateSelector ??= (state: any) => state[cache.name]
  // @ts-expect-error private field for testing
  partialCache.abortControllers = abortControllers

  const cache = partialCache as TypedCache

  // make selectors

  const selectQueryState = <QK extends keyof (QP & QR)>(
    state: unknown,
    query: QK,
    cacheKey: Key
  ): QueryMutationState<QK extends keyof (QP | QR) ? QR[QK] : never> | undefined => {
    // @ts-expect-error fix later
    return cache.cacheStateSelector(state).queries[query][cacheKey]
  }

  const selectMutationState = <MK extends keyof (MP & MR)>(
    state: unknown,
    mutation: MK
  ): QueryMutationState<MK extends keyof (MP | MR) ? MR[MK] : never> => {
    // @ts-expect-error fix later
    return cache.cacheStateSelector(state).mutations[mutation]
  }

  const actions = createActions<N, T, QR, MR>(cache.name)

  return {
    /** Keeps all options, passed while creating the cache. */
    cache,
    /** Reducer of the cache, should be added to redux store. */
    reducer: createCacheReducer<N, T, QR, MR>(
      actions,
      cache.typenames,
      Object.keys(cache.queries) as (keyof QR)[],
      cache.options
    ),
    actions,
    selectors: {
      /** Selects query state. */
      selectQueryState,
      /** Selects query latest result. */
      selectQueryResult: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
        return selectQueryState(state, query, cacheKey)?.result
      },
      /** Selects query loading state. */
      selectQueryLoading: <QK extends keyof (QP & QR)>(
        state: unknown,
        query: QK,
        cacheKey: Key
      ) => {
        return selectQueryState(state, query, cacheKey)?.loading
      },
      /** Selects query latest error. */
      selectQueryError: <QK extends keyof (QP & QR)>(state: unknown, query: QK, cacheKey: Key) => {
        return selectQueryState(state, query, cacheKey)?.error
      },
      /** Selects mutation state. */
      selectMutationState,
      /** Selects mutation latest result. */
      selectMutationResult: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => {
        return selectMutationState(state, mutation).result
      },
      /** Selects mutation loading state. */
      selectMutationLoading: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => {
        return selectMutationState(state, mutation).loading
      },
      /** Selects mutation latest error. */
      selectMutationError: <MK extends keyof (MP & MR)>(state: unknown, mutation: MK) => {
        return selectMutationState(state, mutation).error
      },
      /** Selects entity by id and typename. */
      selectEntityById: <TN extends keyof T>(
        state: unknown,
        id: Key | null | undefined,
        typename: TN
      ) => {
        return id == null ? undefined : cache.cacheStateSelector(state).entities[typename][id]
      },
      /** Selects all entities. */
      selectEntities: (state: unknown) => {
        return cache.cacheStateSelector(state).entities
      },
      /** Selects all entities of provided typename. */
      selectEntitiesByTypename: <TN extends keyof T>(state: unknown, typename: TN) => {
        return cache.cacheStateSelector(state).entities[typename]
      },
    },
    hooks: {
      /** Returns client object with query and mutate functions. */
      useClient: () => {
        const store = useStore()
        return useMemo(() => {
          const client = {
            query: <QK extends keyof (QP & QR)>(
              options: Omit<QueryOptions<T, QP, QR, MR, QK>, 'cachePolicy'>
            ) => {
              type P = QK extends keyof (QP | QR) ? QP[QK] : never
              type R = QK extends keyof (QP | QR) ? QR[QK] : never

              const {query: queryKey, params} = options
              const getCacheKey = cache.queries[queryKey].getCacheKey ?? defaultGetCacheKey<P>
              // @ts-expect-error fix later
              const cacheKey = getCacheKey(params)

              return queryImpl(
                'query',
                store,
                cache,
                actions,
                queryKey,
                cacheKey,
                params
              ) as Promise<QueryResult<R>>
            },
            mutate: <MK extends keyof (MP & MR)>(options: {
              mutation: MK
              params: MK extends keyof (MP | MR) ? MP[MK] : never
            }) => {
              type R = MK extends keyof (MP | MR) ? MR[MK] : never

              return mutateImpl(
                'mutate',
                store,
                cache,
                actions,
                options.mutation,
                options.params,
                abortControllers
              ) as Promise<MutationResult<R>>
            },
          }
          return client
        }, [store])
      },

      /** Fetches query when params change and subscribes to query state. */
      useQuery: <QK extends keyof (QP & QR)>(
        options: Parameters<typeof useQuery<N, T, QP, QR, MP, MR, QK>>[2]
      ) => useQuery(cache, actions, options),

      /** Subscribes to provided mutation state and provides mutate function. */
      useMutation: <MK extends keyof (MP & MR)>(
        options: Parameters<typeof useMutation<N, T, MP, MR, MK>>[2]
      ) => useMutation(cache, actions, options, abortControllers),
    },
    utils: {
      /**
       * Apply changes to the entities map.
       * @return `undefined` if nothing to change, otherwise new entities map with applied changes.
       */
      applyEntityChanges: (
        entities: Parameters<typeof applyEntityChanges<T>>[0],
        changes: Parameters<typeof applyEntityChanges<T>>[1]
      ) => {
        return applyEntityChanges<T>(entities, changes, cache.options)
      },
    },
  }
}
