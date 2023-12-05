import {useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'

import {getAbortController, mutate as mutateImpl} from './mutate'
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

  const store = useStore()

  // Using single useMemo for performance reasons
  const [mutationStateSelector, mutate, abort] = useMemo(
    () => {
      return [
        // mutationStateSelector
        (state: unknown) => {
          cache.options.logsEnabled &&
            log('mutationStateSelector', {
              state,
              cacheState: cache.cacheStateSelector(state),
            })
          return cache.cacheStateSelector(state).mutations[mutationKey as keyof MR]
        },
        // mutate
        async (params: P) => {
          await mutateImpl(
            'useMutation.mutate',
            false,
            store,
            cache,
            mutationKey,
            cacheOptions,
            params
          )
        },
        // abort
        () => {
          const abortController = getAbortController(store, mutationKey)
          if (abortController === undefined || abortController.signal.aborted) {
            return false
          }
          abortController.abort()
          cacheOptions.cacheMutationState &&
            store.dispatch(
              setMutationStateAndEntities<T, MR, keyof MR>(mutationKey as keyof MR, {
                loading: false,
              })
            )
          return true
        },
      ]
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, cacheOptions.cacheEntities, cacheOptions.cacheMutationState]
  )

  // @ts-expect-error fix later
  const mutationState: QueryMutationState<R> =
    useSelector(mutationStateSelector) ?? defaultQueryMutationState

  cache.options.logsEnabled &&
    log('useMutation', {
      options,
      mutationState,
    })

  return [mutate, mutationState, abort] as const
}
