import {useSelector} from 'react-redux'
import {
  createCacheReducer,
  mergeEntityChanges,
  setMutationStateAndEntities,
  setQueryStateAndEntities,
} from './reducer'
import {Cache, CacheOptions, EntitiesMap, Key, OptionalPartial, Typenames} from './types'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'
import {isDev, useAssertValueNotChanged} from './utilsAndConstants'
import {Schema, denormalize} from 'normalizr'
import {useMemo} from 'react'

// Backlog

// ! high
// create package with README
// cover with tests

// ! medium
// provide call query/mutation function to call them without hooks, but with all state updates
// get typenames from schema? (useSelectDenormalized)
// callback option on error / success?
// cache policy as function? needsRefetch
// add verbose debug logs
// refetch queries on query / mutation success?
// remove state when it finished without errors
// set default options like getParams
// selectors for loading state of similar query or mutation (wihout using params as key)
// deep equal entities while merging state
// support multiple stores
// add validation if entity is full enough
// optimistic response
// make error type generic
// proper types, remove as, any, todo

// ! low
// cancellation to queries
// if mutation & query alrady loading - make options: last, throttle, debounce, parallel?
// add time-to-live option, and/or time-to-refresh
// add getUpdateTime option to check entities while merging
// useLocalMutation - uses local component state, or make store option - redux or component state or context? 1 version: redux only
// replace try/catch with returned error
// support any store, not only redux
// QueryInfo.defaultOptions
// set options in refresh/mutate functions
// multiple reducers instead of 1?
// don't cache result if resultSelector set?

export * from './reducer'
export * from './types'
export * from './useMutation'
export * from './useQuery'
export * from './utilsAndConstants'

/** Creates reducer, actions and hooks for managing queries and mutations through redux cache. */
export const createCache = <T extends Typenames, QP, QR, MP, MR>(
  cache: OptionalPartial<Cache<T, QP, QR, MP, MR>, 'options'>
) => {
  // @ts-expect-error hot
  const hotReloadEnabled = Boolean(module?.hot)

  // provide all optional fields

  cache.options ??= {} as CacheOptions
  cache.options.logsEnabled ??= false
  cache.options.validateFunctionArguments ??= isDev
  cache.options.validateHookArguments ??= isDev && !hotReloadEnabled

  const nonPartialCache = cache as Cache<T, QP, QR, MP, MR>

  // make selectors

  const entitiesSelector = (state: any) => {
    return nonPartialCache.cacheStateSelector(state).entities
  }

  const enitityMapSelectorByTypename = Object.keys(cache.typenames).reduce((result, x: keyof T) => {
    result[x] = (state: any) => nonPartialCache.cacheStateSelector(state).entities[x]
    return result
  }, {} as {[K in keyof T]: (state: any) => EntitiesMap<T>[K]})

  return {
    cache: nonPartialCache,
    /** Reducer of the cache, should be added to redux store. */
    reducer: createCacheReducer<T, QP, QR, MP, MR>(
      nonPartialCache.typenames,
      nonPartialCache.queries,
      nonPartialCache.mutations,
      nonPartialCache.options
    ),
    actions: {
      /** Updates query state, and optionally merges entity changes in a single action. */
      setQueryStateAndEntities: setQueryStateAndEntities as <K extends keyof QR>(
        ...args: Parameters<typeof setQueryStateAndEntities<T, QR, K>>
      ) => ReturnType<typeof setQueryStateAndEntities<T, QR, K>>,

      /** Updates mutation state, and optionally merges entity changes in a single action. */
      setMutationStateAndEntities: setMutationStateAndEntities as <K extends keyof MR>(
        ...args: Parameters<typeof setMutationStateAndEntities<T, MR, K>>
      ) => ReturnType<typeof setMutationStateAndEntities<T, MR, K>>,

      /** Merge EntityChanges to the state. */
      mergeEntityChanges: mergeEntityChanges as typeof mergeEntityChanges<T>,
    },
    hooks: {
      /** Fetches query when params change and subscribes to query state. */
      useQuery: <QK extends keyof (QP & QR)>(
        options: Parameters<typeof useQuery<T, QP, QR, MP, MR, QK>>[1]
      ) => useQuery(nonPartialCache, options),

      /** Subscribes to provided mutation state and provides mutate function. */
      useMutation: <MK extends keyof (MP & MR)>(
        options: Parameters<typeof useMutation<T, MP, MR, MK>>[1]
      ) => useMutation(nonPartialCache, options),

      /** Selects entity by id and subscribes to the changes. */
      useSelectEntityById: <K extends keyof T>(
        id: Key | null | undefined,
        typename: K
      ): T[K] | undefined => {
        return useSelector((state) =>
          id == null ? undefined : nonPartialCache.cacheStateSelector(state).entities[typename][id]
        )
      },

      /**
       * Denormalizes provided input with schema and subscribes to changes of provided typenames.
       * It is not recommended to use this hook. Prefer using useSelectEntityById.
       * Keep in mind that normalized types differ from denormalized.
       * */
      useSelectDenormalized: <S = any>(
        /** Passed as input to denormalize function of normalizr. */
        input: any,
        /** Passed as schema to denormalize function of normalizr. */
        schema: Schema<S>,
        /**
         * Set on which typenames result depends, to optimize redux state subscriptions and re-renders.
         * If undefined then dependent on all entities.
         * Should not change length during runtime. Not required to be memoized.
         * */
        dependentEntities?: (keyof T)[]
      ) => {
        nonPartialCache.options.validateHookArguments &&
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useAssertValueNotChanged('dependentEntities.length', dependentEntities?.length)

        const dependentEntityMaps =
          // eslint-disable-next-line react-hooks/rules-of-hooks
          dependentEntities?.map((x) => useSelector(enitityMapSelectorByTypename[x])) ??
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useSelector(entitiesSelector)
        const isArray = Array.isArray(dependentEntityMaps)

        const result = useMemo(
          () =>
            denormalize(
              input,
              schema,
              dependentEntities && isArray
                ? dependentEntities.reduce((map, x, i) => {
                    map[x] = dependentEntityMaps[i]
                    return map
                  }, {} as Partial<EntitiesMap<T>>)
                : dependentEntityMaps
            ),
          // eslint-disable-next-line react-hooks/exhaustive-deps
          isArray ? [...dependentEntityMaps, input, schema] : [dependentEntityMaps, input, schema]
        )

        return result
      },
    },
  }
}
