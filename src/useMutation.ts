import {useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'
import {Store} from 'redux'

import {ActionMap} from './createActions'
import {mutate as mutateImpl} from './mutate'
import {Cache, Key, QueryMutationState, Typenames} from './types'
import {DEFAULT_QUERY_MUTATION_STATE, log} from './utilsAndConstants'

export const useMutation = <
  N extends string,
  T extends Typenames,
  MP,
  MR,
  MK extends keyof (MP & MR)
>(
  cache: Cache<N, T, unknown, unknown, MP, MR>,
  actions: Pick<ActionMap<N, T, unknown, MR>, 'updateMutationStateAndEntities'>,
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
          actions,
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
          actions.updateMutationStateAndEntities(mutationKey as keyof MR, {
            loading: false,
          })
        )
        return true
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutationKey, store])

  const mutationState: QueryMutationState<R> =
    useSelector(mutationStateSelector) ?? DEFAULT_QUERY_MUTATION_STATE

  cache.options.logsEnabled &&
    log('useMutation', {
      options,
      mutationState,
    })

  return [mutate, mutationState, abort] as const
}
