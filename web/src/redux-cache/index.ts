import {useSelector} from 'react-redux'
import {
  createCacheReducer,
  mergeEntityChanges,
  setMutationStateAndEntities,
  setQueryStateAndEntities,
} from './reducer'
import {Cache, CacheOptions, EntitiesMap, Mutation, Optional, Query, Typenames} from './types'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'
import {defaultCacheStateSelector, isDev, useAssertValueNotChanged} from './utilsAndConstants'
import {Schema, denormalize} from 'normalizr'
import {useMemo} from 'react'

// Backlog

// ! high
// support hot reload
// documentation
// cover with tests

// ! medium
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

export * from './reducer'
export * from './types'
export * from './useMutation'
export * from './useQuery'
export * from './utilsAndConstants'

export const createCache = <T extends Typenames, QR extends object, MR extends object>(
  optionalCache: Optional<Cache<T, QR, MR>, 'options' | 'cacheStateSelector'>
) => {
  // provide all optional fields

  // @ts-expect-error
  const hotReloadDisabled = !module?.hot

  optionalCache.options ??= {} as CacheOptions
  optionalCache.options.logsEnabled ??= isDev
  optionalCache.options.runtimeErrorChecksEnabled ??= isDev && hotReloadDisabled

  optionalCache.cacheStateSelector ??= defaultCacheStateSelector

  const cache = optionalCache as Cache<T, QR, MR>

  // make selectors

  const entitiesSelector = (state: any) => {
    return cache.cacheStateSelector(state).entities
  }

  const enitityMapSelectorByTypename = Object.keys(optionalCache.typenames).reduce(
    (result, x: keyof T) => {
      result[x] = (state: any) => cache.cacheStateSelector(state).entities[x]
      return result
    },
    {} as {[K in keyof T]: (state: any) => EntitiesMap<T>[K]}
  )

  return {
    cache,
    useQuery: <Q extends Query<T, any, any>>(options: Parameters<typeof useQuery<T, Q>>[1]) =>
      useQuery(cache, options),
    useMutation: <M extends Mutation<T, any, any>>(
      options: Parameters<typeof useMutation<T, M>>[1]
    ) => useMutation(cache, options),
    reducer: createCacheReducer(cache.typenames, cache.queries, cache.mutations, cache.options),
    actions: {
      setQueryStateAndEntities: setQueryStateAndEntities as <K extends keyof QR>(
        ...args: Parameters<typeof setQueryStateAndEntities<T, QR, K>>
      ) => ReturnType<typeof setQueryStateAndEntities<T, QR, K>>,

      setMutationStateAndEntities: setMutationStateAndEntities as <K extends keyof MR>(
        ...args: Parameters<typeof setMutationStateAndEntities<T, MR, K>>
      ) => ReturnType<typeof setMutationStateAndEntities<T, MR, K>>,

      mergeEntityChanges: mergeEntityChanges as typeof mergeEntityChanges<T>,
    },
    selectors: {
      entitiesSelector,
      useDenormalizeSelector: (
        input: any,
        schema: Schema<any>,
        /**
         * Set on which typenames result depends, to optimize redux state subscriptions and re-renders.
         * If undefined then dependent on all entities.
         * Should not change length during runtime. Not required to be memoized.
         * */
        dependentEntities?: (keyof T)[]
      ) => {
        cache.options.runtimeErrorChecksEnabled &&
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useAssertValueNotChanged('dependentEntities.length', dependentEntities?.length)

        const dependentEntityMaps =
          // eslint-disable-next-line react-hooks/rules-of-hooks
          dependentEntities?.map((x) => useSelector(enitityMapSelectorByTypename[x])) ??
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useSelector(entitiesSelector)
        const isArray = Array.isArray(dependentEntityMaps)

        return useMemo(
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
      },
    },
  }
}
