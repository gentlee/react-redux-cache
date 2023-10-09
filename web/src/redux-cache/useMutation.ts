import {useCallback, useRef} from 'react'
import {useDispatch, useSelector, useStore} from 'react-redux'
import {setStateAction} from 'redux-light'
import {
  defaultEndpointState,
  mergeResponseToEntities,
  useAssertValueNotChanged,
} from './utilsAndConstants'
import {
  Cache,
  ExtractMutationParams,
  ExtractMutationResult,
  MutationCacheOptions,
  MutationInfo,
  MutationResponse,
  QueryMutationState,
  Typenames,
} from './types'

export const DEFAULT_MUTATION_CACHE_OPTIONS: MutationCacheOptions = {
  cacheMutationState: true,
  cacheEntities: true,
}

export const useMutation = <
  T extends Typenames,
  M extends Record<keyof M, MutationInfo<T, any, any>>,
  MK extends keyof M
>(
  cache: Cache<T, any, M>,
  options: {
    mutation: MK
    cacheOptions?: MutationCacheOptions
  }
) => {
  type P = ExtractMutationParams<M, MK>
  type D = ExtractMutationResult<M, MK>

  const {
    mutation: mutationKey,
    cacheOptions = cache.mutations[mutationKey].cacheOptions ?? DEFAULT_MUTATION_CACHE_OPTIONS,
  } = options

  const dispatch = useDispatch()
  const store = useStore()

  cache.options.logsEnabled &&
    console.log('[useMutation]', {
      state: store.getState(),
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

  // no useCallback because deps are empty
  const mutationStateSelector = (state: any) => {
    cache.options.logsEnabled &&
      console.log('[mutationStateSelector]', {
        state,
        cacheState: cache.cacheStateSelector(state),
      })
    return cache.cacheStateSelector(state).mutations[mutationKey]
  }

  // no useCallback because deps are empty
  const setMutationState = (
    newState: Partial<QueryMutationState<T>> | undefined,
    response?: MutationResponse<T, D>
  ) => {
    const entities = cache.cacheStateSelector(store.getState()).entities
    const newEntities = response && mergeResponseToEntities(entities, response, cache.options)

    if (!newState && !newEntities) return

    dispatch(
      setStateAction({
        ...(newEntities ? {entities: newEntities} : null),
        mutations: {
          [mutationKey]: {
            ...mutationStateSelector(store.getState()),
            ...newState,
          },
        },
      })
    )
  }

  const mutationState = useSelector(mutationStateSelector) ?? defaultEndpointState

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
        cacheOptions.cacheMutationState && setMutationState({loading: true})
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
          data: response,
          error,
          aborted: abortController.signal.aborted,
        })

      if (abortController.signal.aborted) {
        return
      }

      abortControllerRef.current = undefined

      if (response) {
        setMutationState(
          cacheOptions.cacheMutationState
            ? {
                error: undefined,
                loading: false,
                data: response.result,
              }
            : undefined,
          cacheOptions.cacheEntities ? response : undefined
        )
      } else if (error && cacheOptions.cacheMutationState) {
        setMutationState({error: error as Error, loading: false})
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return [mutate, mutationState, abortControllerRef.current] as const
}
