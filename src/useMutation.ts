import {useCallback, useRef} from 'react'
import {useDispatch, useSelector} from 'react-redux'

import {setMutationStateAndEntities} from './reducer'
import {Cache, MutationCacheOptions, QueryMutationState, Typenames} from './types'
import {defaultQueryMutationState, log, useAssertValueNotChanged} from './utilsAndConstants'

export const defaultMutationCacheOptions: MutationCacheOptions = {
  cacheMutationState: true,
  cacheEntities: true,
}

export const useMutation = <T extends Typenames, MP, MR, MK extends keyof (MP & MR)>(
  cache: Cache<T, unknown, unknown, MP, MR>,
  options: {
    mutation: MK
    cacheOptions?: MutationCacheOptions
  }
) => {
  type P = MK extends keyof (MP | MR) ? MP[MK] : never
  type R = MK extends keyof (MP | MR) ? MP[MK] : never

  const {
    mutation: mutationKey,
    cacheOptions = cache.mutations[mutationKey].cacheOptions ?? defaultMutationCacheOptions,
  } = options

  const dispatch = useDispatch()

  cache.options.logsEnabled &&
    log('useMutation', {
      cacheOptions,
    })

  // Check values that should be set once.
  // Can be removed from deps.
  cache.options.validateHookArguments &&
    (() => {
      ;(
        [
          ['cache', cache],
          ['cache.options', cache.options],
          ['cache.options.logsEnabled', cache.options.logsEnabled],
          ['cacheStateSelector', cache.cacheStateSelector],
          ['mutationKey', mutationKey],
          ['cacheOptions.cacheEntities', cacheOptions.cacheEntities],
          ['cacheOptions.cacheMutationState', cacheOptions.cacheMutationState],
        ] as [key: string, value: unknown][]
      )
        // eslint-disable-next-line react-hooks/rules-of-hooks
        .forEach((args) => useAssertValueNotChanged(...args))
    })()

  const abortControllerRef = useRef<AbortController>()

  const mutationStateSelector = useCallback((state: unknown) => {
    cache.options.logsEnabled &&
      log('mutationStateSelector', {
        state,
        cacheState: cache.cacheStateSelector(state),
      })
    return cache.cacheStateSelector(state).mutations[mutationKey as keyof MR]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // @ts-expect-error fix later
  const mutationState: QueryMutationState<R> =
    useSelector(mutationStateSelector) ?? defaultQueryMutationState

  const mutate = useCallback(
    async (params: P) => {
      cache.options.logsEnabled &&
        log('mutate', {
          mutationKey,
          params,
          abortController: abortControllerRef.current,
        })

      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      } else {
        cacheOptions.cacheMutationState &&
          dispatch(
            setMutationStateAndEntities<T, MR, keyof MR>(mutationKey as keyof MR, {loading: true})
          )
      }
      const abortController = new AbortController()
      abortControllerRef.current = abortController

      let response
      let error
      const fetchFn = cache.mutations[mutationKey].mutation
      try {
        response = await fetchFn(
          // @ts-expect-error fix later
          params,
          abortController.signal
        )
      } catch (e) {
        error = e
      }

      cache.options.logsEnabled &&
        log('mutate finished', {
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
            mutationKey as keyof MR,
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
          setMutationStateAndEntities<T, MR, keyof MR>(mutationKey as keyof MR, {
            error: error as Error,
            loading: false,
          })
        )
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )

  return [mutate, mutationState, abortControllerRef.current] as const
}
