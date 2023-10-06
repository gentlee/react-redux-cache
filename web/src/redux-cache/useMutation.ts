import {useRef} from 'react'
import {useDispatch, useSelector, useStore} from 'react-redux'
import {setStateAction} from 'redux-light'
import {defaultEndpointState, shallowMerge, useAssertValueNotChanged} from './utilsAndConstants'
import {
  Cache,
  EntitiesMap,
  ExtractMutationParams,
  ExtractMutationResult,
  MutationCacheOptions,
  MutationResponse,
  QueryMutationState,
} from './types'

export const DEFAULT_MUTATION_CACHE_OPTIONS: MutationCacheOptions = {
  cacheMutationState: true,
  cacheEntities: true,
}

export const useMutation = <
  T,
  M extends Record<
    keyof M,
    (
      params: Parameters<M[keyof M]>[0],
      abortSignal: AbortSignal
    ) => Promise<MutationResponse<T, ExtractMutationResult<M[keyof M]>>>
  >,
  P = ExtractMutationParams<M[keyof M]>,
  D = ExtractMutationResult<M[keyof M]>
>(
  cache: Cache<T, any, M>,
  options: {
    mutation: keyof M
    cacheOptions?: MutationCacheOptions
  }
) => {
  const {mutation: mutationKey, cacheOptions = DEFAULT_MUTATION_CACHE_OPTIONS} = options

  const dispatch = useDispatch()
  const store = useStore()

  console.log('[useMutation]', {
    state: store.getState(),
    cacheOptions,
  })

  // Check values that should be set once.
  cache.options.runtimeErrorChecksEnabled &&
    (() => {
      ;(
        [
          ['cache', cache],
          ['cacheStateSelector', cache.cacheStateSelector],
          ['queryKey', mutationKey],
          ['dataSelector', cache.mutations[mutationKey]],
        ] as [key: string, value: any][]
      ).forEach((args) => useAssertValueNotChanged(...args))
    })()

  const abortControllerRef = useRef<AbortController>()

  const mutationStateSelector = (state: any) => {
    console.log('[mutationStateSelector]', {
      state,
      cacheState: cache.cacheStateSelector(state),
    })
    return cache.cacheStateSelector(state).mutations[mutationKey] as QueryMutationState<D>
  }

  const setMutationState = (newState: any, normalizedEntities?: Partial<EntitiesMap<T>>) => {
    if (!newState && !normalizedEntities) return

    dispatch(
      setStateAction({
        entities: shallowMerge(
          cache.cacheStateSelector(store.getState()).entities,
          normalizedEntities
        ),
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

  const mutate = async (params: P) => {
    console.log('[mutate]', {
      mutationState,
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

    let data
    let error
    const fetchFn = cache.mutations[mutationKey]
    try {
      data = await fetchFn(params, abortController.signal)
    } catch (e) {
      error = e
    }

    console.log('[mutate] finished', {
      data,
      error,
      aborted: abortController.signal.aborted,
    })

    if (abortController.signal.aborted) {
      return
    }

    abortControllerRef.current = undefined

    if (data) {
      setMutationState(
        cacheOptions.cacheMutationState
          ? {
              error: undefined,
              loading: false,
              data: data.result,
            }
          : undefined,
        cacheOptions.cacheEntities ? data.entities : undefined
      )
    } else if (error && cacheOptions.cacheMutationState) {
      setMutationState({error, loading: false})
    }
  }

  return [mutate, mutationState, abortControllerRef.current] as const
}
