import {useMemo} from 'react'

import {mutate as mutateImpl} from '../mutate'
import {CachePrivate} from '../private-types'
import {MutateOptions, MutationState, Typenames} from '../types'
import {EMPTY_OBJECT, logDebug, validateStoreHooks} from '../utilsAndConstants'

export const useMutation = <
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  MK extends keyof (MP & MR),
>(
  cache: Pick<
    CachePrivate<N, T, QP, QR, MP, MR>,
    'abortControllers' | 'actions' | 'selectors' | 'storeHooks' | 'config'
  >,
  options: Omit<MutateOptions<T, MP, MR, MK>, 'params'>,
) => {
  type P = MK extends keyof (MP | MR) ? MP[MK] : never
  type R = MK extends keyof (MP | MR) ? MP[MK] : never

  const {
    config,
    storeHooks,
    abortControllers,
    selectors: {selectMutationState},
    actions: {updateMutationStateAndEntities},
  } = cache

  const {mutation: mutationKey, onCompleted, onSuccess, onError} = options

  validateStoreHooks(storeHooks)

  const innerStore = storeHooks!.useStore()
  const externalStore = storeHooks!.useExternalStore()

  // Using single useMemo for better performance
  const [mutationStateSelector, mutate, abort] = useMemo(() => {
    const mutationStateSelectorFromUseMutation = (state: unknown) => selectMutationState(state, mutationKey)
    const mutateFromUseMutation = async (params: P) => {
      return mutateImpl(
        'useMutation.mutate',
        innerStore,
        externalStore,
        cache,
        mutationKey,
        params,
        // @ts-expect-error fix later
        onCompleted,
        onSuccess,
        onError,
      )
    }
    const abortFromUseMutation = () => {
      const abortController = abortControllers.get(innerStore)?.[mutationKey]
      if (abortController === undefined || abortController.signal.aborted) {
        return false
      }
      abortController.abort()
      innerStore.dispatch(
        updateMutationStateAndEntities(mutationKey as keyof (MP | MR), {loading: undefined}),
      )
      return true
    }
    return [mutationStateSelectorFromUseMutation, mutateFromUseMutation, abortFromUseMutation]
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutationKey, innerStore, externalStore])

  // @ts-expect-error TODO fix types
  const mutationState: MutationState<T, P, R> = storeHooks!.useSelector(mutationStateSelector) ?? EMPTY_OBJECT

  config.options.logsEnabled && logDebug('useMutation', {options, mutationState})

  return [mutate, mutationState, abort] as const
}
