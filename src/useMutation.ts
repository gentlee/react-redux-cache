import {useMemo} from 'react'
import {useSelector, useStore} from 'react-redux'
import {Store} from 'redux'

import {Actions} from './createActions'
import {Selectors} from './createSelectors'
import {mutate as mutateImpl} from './mutate'
import {Cache, Key, MutateOptions, MutationState, Typenames} from './types'
import {EMPTY_OBJECT, log} from './utilsAndConstants'

export const useMutation = <
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  MK extends keyof (MP & MR)
>(
  cache: Cache<N, T, QP, QR, MP, MR>,
  actions: Actions<N, T, QP, QR, MP, MR>,
  selectors: Selectors<N, T, QP, QR, MP, MR>,
  options: Omit<MutateOptions<N, T, QP, QR, MP, MR, MK>, 'params'>,
  abortControllers: WeakMap<Store, Record<Key, AbortController>>
) => {
  type P = MK extends keyof (MP | MR) ? MP[MK] : never
  type R = MK extends keyof (MP | MR) ? MP[MK] : never

  const {mutation: mutationKey, onCompleted, onSuccess, onError} = options

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
        return cache.cacheStateSelector(state).mutations[mutationKey as keyof (MP | MR)]
      },
      // mutate
      async (params: P) => {
        return await mutateImpl(
          'useMutation.mutate',
          store,
          cache,
          actions,
          selectors,
          mutationKey,
          params,
          abortControllers,
          // @ts-expect-error fix later
          onCompleted,
          onSuccess,
          onError
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
          actions.updateMutationStateAndEntities(mutationKey as keyof (MP | MR), {
            loading: false,
          })
        )
        return true
      },
    ]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutationKey, store])

  // @ts-expect-error fix later
  const mutationState: MutationState<P, R> = useSelector(mutationStateSelector) ?? EMPTY_OBJECT

  cache.options.logsEnabled &&
    log('useMutation', {
      options,
      mutationState,
    })

  return [mutate, mutationState, abort] as const
}
