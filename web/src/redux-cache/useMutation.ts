import {useRef} from 'react'
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
  Mutation,
  MutationCacheOptions,
  MutationResponse,
  QueryMutationState,
  Typenames,
} from './types'

export const DEFAULT_MUTATION_CACHE_OPTIONS: MutationCacheOptions = {
  cacheMutationState: true,
  cacheEntities: true,
}

export const useMutation = <T extends Typenames, M extends Record<keyof M, Mutation<T>>>(
  cache: Cache<T, any, M>,
  options: {
    mutation: keyof M
    cacheOptions?: MutationCacheOptions
  }
) => {
  type P = ExtractMutationParams<M[keyof M]>
  type D = ExtractMutationResult<M[keyof M]>

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
          ['mutationKey', mutationKey],
        ] as [key: string, value: any][]
      ).forEach((args) => useAssertValueNotChanged(...args))
    })()

  const abortControllerRef = useRef<AbortController>()

  const mutationStateSelector = (state: any) => {
    console.log('[mutationStateSelector]', {
      state,
      cacheState: cache.cacheStateSelector(state),
    })
    return cache.cacheStateSelector(state).mutations[mutationKey]
  }

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

    let response
    let error
    const fetchFn = cache.mutations[mutationKey]
    try {
      response = await fetchFn(params, abortController.signal)
    } catch (e) {
      error = e
    }

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
  }

  return [mutate, mutationState, abortControllerRef.current] as const
}
