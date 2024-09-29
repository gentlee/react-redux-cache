import {Store} from 'redux'

import type {ActionMap} from './createActions'
import type {Cache, Key, MutationResult, Typenames} from './types'
import {log} from './utilsAndConstants'

export const mutate = async <
  N extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  MK extends keyof (MP & MR)
>(
  logTag: string,
  store: Store,
  cache: Cache<N, T, QP, QR, MP, MR>,
  {
    updateMutationStateAndEntities,
  }: Pick<ActionMap<N, T, unknown, unknown, MP, MR>, 'updateMutationStateAndEntities'>,
  mutationKey: MK,
  params: MK extends keyof (MP | MR) ? MP[MK] : never,
  abortControllers: WeakMap<Store, Record<Key, AbortController>>,
  onCompleted = cache.mutations[mutationKey].onCompleted,
  onSuccess = cache.mutations[mutationKey].onSuccess,
  onError = cache.mutations[mutationKey].onError
): Promise<MutationResult<MK extends keyof (MP | MR) ? MR[MK] : never>> => {
  let abortControllersOfStore = abortControllers.get(store)
  if (abortControllersOfStore === undefined) {
    abortControllersOfStore = {}
    abortControllers.set(store, abortControllersOfStore)
  }

  {
    const abortController = abortControllersOfStore[mutationKey]

    cache.options.logsEnabled &&
      log(logTag, {
        mutationKey,
        params,
        previousAborted: abortController !== undefined,
      })

    if (abortController !== undefined) {
      abortController.abort()
    } else {
      store.dispatch(
        updateMutationStateAndEntities(mutationKey as keyof (MP | MR), {
          loading: true,
          params,
          result: undefined,
        })
      )
    }
  }

  const abortController = new AbortController()
  abortControllersOfStore[mutationKey] = abortController

  let response
  let error
  const fetchFn = cache.mutations[mutationKey].mutation
  try {
    response = await fetchFn(
      // @ts-expect-error fix later
      params,
      store,
      abortController.signal
    )
  } catch (e) {
    error = e
  }

  cache.options.logsEnabled &&
    log(`${logTag} finished`, {
      response,
      error,
      aborted: abortController.signal.aborted,
    })

  if (abortController.signal.aborted) {
    return ABORTED_RESULT
  }

  delete abortControllersOfStore[mutationKey]

  if (error) {
    store.dispatch(
      updateMutationStateAndEntities(mutationKey as keyof (MP | MR), {
        error: error as Error,
        loading: false,
      })
    )
    // @ts-expect-error params
    if (!onError?.(error, params, store)) {
      // @ts-expect-error queryKey
      cache.globals.onError?.(error, mutationKey, params, store)
    }
    // @ts-expect-error response
    onCompleted?.(response, error, params, store)

    return {error}
  }

  if (response) {
    const newState = {
      error: undefined,
      loading: false,
      result: response.result,
    }

    store.dispatch(updateMutationStateAndEntities(mutationKey as keyof (MP | MR), newState, response))
    // @ts-expect-error params
    onSuccess?.(response, params, store)
    // @ts-expect-error response
    onCompleted?.(response, error, params, store)

    // @ts-expect-error fix later
    return {result: response.result}
  }

  throw new Error(`${logTag}: both error and response are not defined`)
}

const ABORTED_RESULT = Object.freeze({aborted: true})
