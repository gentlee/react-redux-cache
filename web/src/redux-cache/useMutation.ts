import { useRef } from 'react'
import { useDispatch, useSelector, useStore } from 'react-redux'
import { setStateAction } from 'redux-light'
import { QueryCacheOptions, QueryState } from './useQuery'
import { defaultCacheStateSelector, defaultEndpointState, shallowMerge } from './utilsAndConstants'
import { Response } from './types'

export type Mutation<MutationParams = unknown, Data = unknown> = (
  params: MutationParams
) => Promise<Response<Data>[]>

export type MutationCacheOptions = Pick<QueryCacheOptions, 'cacheEntities'> & {
  cacheMutationState: boolean
}

export const DEFAULT_CACHE_OPTIONS: MutationCacheOptions = {
  cacheMutationState: true,
  cacheEntities: true
}

export const useMutation = <
  TCache,
  TMutations extends Record<TMutationKey, Mutation>,
  TMutationKey extends string = string,
  TData = any,
  TError = unknown,
  TState = unknown,
  TCacheState = unknown,
  TParams extends Parameters<TMutations[TMutationKey]> = any
>({
  mutation: mutationKey,
  cache,
  cacheOptions = DEFAULT_CACHE_OPTIONS,
  cacheStateSelector = defaultCacheStateSelector
}: {
  mutation: TMutationKey
  cache: TCache
  cacheOptions?: MutationCacheOptions,
  cacheStateSelector?: (state: TState) => TCacheState
}) => {
  const dispatch = useDispatch()
  const store = useStore()

  console.log('[useMutation]', {
    state: store.getState(),
    cacheOptions,
  })

  const abortControllerRef = useRef<AbortController>()

  // @ts-ignore
  const mutationStateSelector = (state: ReduxState) => {
    console.log('[mutationStateSelector]', {
      state,
      cacheState: cacheStateSelector(state)
    })
    // @ts-ignore
    return cacheStateSelector(state).mutations[mutationKey] as QueryState<TData, TError>
  }

  const setMutationState = (newState: any, normalizedEntities?: any) => {
    if (!newState && !normalizedEntities) return

    dispatch(setStateAction({
      // @ts-ignore
      entities: shallowMerge(cacheStateSelector(store.getState()).entities, normalizedEntities),
      mutations: {
        [mutationKey]: {
          ...mutationStateSelector(store.getState()),
          ...newState
        }
      }
    }))
  }

  const mutationState = useSelector(mutationStateSelector) ?? defaultEndpointState

  const mutate = async (params: TParams) => {
    console.log('[mutate]', { mutationState, mutationKey, params, abortController: abortControllerRef.current })

    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    } else {
      cacheOptions.cacheMutationState && setMutationState({ loading: true })
    }
    const abortController = new AbortController()
    abortControllerRef.current = abortController

    let data
    let error
    // @ts-ignore
    const fetchFn = cache.mutations[mutationKey]
    try {
      data = await fetchFn(params, abortController.signal)
    } catch (e) {
      error = e
    }

    console.log('[mutate] finished', {
      data,
      error,
      aborted: abortController.signal.aborted
    })

    if (abortController.signal.aborted) {
      return
    }

    abortControllerRef.current = undefined

    if (data) {
      setMutationState(
        cacheOptions.cacheMutationState ? {
          error: undefined,
          loading: false,
          data: data.result
        } : undefined,
        cacheOptions.cacheEntities ? data.entities : undefined
      )
    } else if (error && cacheOptions.cacheMutationState) {
      setMutationState({ error, loading: false })
    }
  }

  return [mutate, mutationState, abortControllerRef.current] as const
}
