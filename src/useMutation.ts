import {useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'
import {Store} from 'redux'

import {updateMutationStateAndEntities} from './actions'
import {mutate as mutateImpl} from './mutate'
import {Cache, Key, QueryMutationState, Typenames} from './types'
import {DEFAULT_QUERY_MUTATION_STATE, log} from './utilsAndConstants'

export const useMutation = <T extends Typenames, MP, MR, MK extends keyof (MP & MR)>(
  cache: Cache<T, unknown, unknown, MP, MR>,
  options: {
    mutation: MK
  },
  abortControllers: WeakMap<Store, Record<Key, AbortController>>
) => {
  type P = MK extends keyof (MP | MR) ? MP[MK] : never
  type R = MK extends keyof (MP | MR) ? MP[MK] : never

  const {mutation: mutationKey} = options

  const store = useStore()

  // Using single useMemo for performance reasons
  const [mutationStateSelector, mutate, abort] = useMemo(() => {
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
          params,
          abortControllers
        )
      },
      // abort
      () => {
        const abortController = abortControllers.get(store)?.[mutationKey]
        if (abortController === undefined || abortController.signal.aborted) {
          return false
        }
        abortController.abort()
        store.dispatch(
          updateMutationStateAndEntities<T, MR, keyof MR>(mutationKey as keyof MR, {
            loading: false,
          })
        )
        return true
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutationKey, store])

  // @ts-expect-error fix later
  const mutationState: QueryMutationState<R> =
    useSelector(mutationStateSelector) ?? DEFAULT_QUERY_MUTATION_STATE

  cache.options.logsEnabled &&
    log('useMutation', {
      options,
      mutationState,
    })

  return [mutate, mutationState, abort] as const
}
