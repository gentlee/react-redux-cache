import {useCallback, useMemo, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'
import {defaultEndpointState, useAssertValueNotChanged} from './utilsAndConstants'
import {Cache, Mutation, MutationCacheOptions, QueryMutationState, Typenames} from './types'
import {setMutationStateAndEntities} from './reducer'

export const DEFAULT_MUTATION_CACHE_OPTIONS: MutationCacheOptions = {
  cacheMutationState: true,
  cacheEntities: true,
}

export const useMutation = <T extends Typenames, M extends Mutation<T, any, any>>(
  cache: Cache<T, any, any>,
  options: {
    mutation: M
    cacheOptions?: MutationCacheOptions
  }
) => {
  type P = M extends Mutation<T, infer P, any> ? P : never
  type R = M extends Mutation<T, any, infer R> ? R : never

  const mutationKey = useMemo(() => {
    const mutationKeys = Object.keys(cache.mutations)
    for (const key of mutationKeys) {
      if (cache.mutations[key].mutation === options.mutation) {
        return key
      }
    }
    throw new Error(`Can't find mutation function in cache.mutations.`)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const {
    cacheOptions = cache.mutations[mutationKey].cacheOptions ?? DEFAULT_MUTATION_CACHE_OPTIONS,
  } = options

  const dispatch = useDispatch()

  cache.options.logsEnabled &&
    console.log('[useMutation]', {
      cacheOptions,
    })

  // Check values that should be set once.
  // Can be removed from deps.
  cache.options.runtimeErrorChecksEnabled &&
    (() => {
      ;(
        [
          ['cache', cache],
          ['cache.options', cache.options],
          ['cache.options.logsEnabled', cache.options.logsEnabled],
          ['cache.options.runtimeErrorChecksEnabled', cache.options.runtimeErrorChecksEnabled],
          ['cacheStateSelector', cache.cacheStateSelector],
          ['mutationKey', mutationKey],
          ['cacheOptions.cacheEntities', cacheOptions.cacheEntities],
          ['cacheOptions.cacheMutationState', cacheOptions.cacheMutationState],
        ] as [key: string, value: any][]
      )
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .forEach((args) => useAssertValueNotChanged(...args))
    })()

  const abortControllerRef = useRef<AbortController>()

  const mutationStateSelector = useCallback((state: any) => {
    cache.options.logsEnabled &&
      console.log('[mutationStateSelector]', {
        state,
        cacheState: cache.cacheStateSelector(state),
      })
    return cache.cacheStateSelector(state).mutations[mutationKey]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mutationState: QueryMutationState<R> =
    useSelector(mutationStateSelector) ?? defaultEndpointState

  const mutate = useCallback(
    async (params: P) => {
      cache.options.logsEnabled &&
        console.log('[mutate]', {
          mutationKey,
          params,
          abortController: abortControllerRef.current,
        })

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      } else {
        cacheOptions.cacheMutationState &&
          dispatch(
            setMutationStateAndEntities(
              // @ts-ignore
              mutationKey,
              {loading: true}
            )
          )
      }
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      let response
      let error
      const fetchFn = cache.mutations[mutationKey].mutation
      try {
        response = await fetchFn(params, abortController.signal)
      } catch (e) {
        error = e
      }

      cache.options.logsEnabled &&
        console.log('[mutate] finished', {
          response,
          error,
          aborted: abortController.signal.aborted,
        })

      if (abortController.signal.aborted) {
        return
      }

      abortControllerRef.current = undefined

      if (response) {
        dispatch(
          setMutationStateAndEntities(
            // @ts-ignore
            mutationKey,
            cacheOptions.cacheMutationState
              ? {
                  error: undefined,
                  loading: false,
                  result: response.result,
                }
              : undefined,
            cacheOptions.cacheEntities ? response : undefined
          )
        )
      } else if (error && cacheOptions.cacheMutationState) {
        dispatch(
          setMutationStateAndEntities(
            // @ts-ignore
            mutationKey,
            {error: error as Error, loading: false}
          )
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return [mutate, mutationState, abortControllerRef.current] as const
}
