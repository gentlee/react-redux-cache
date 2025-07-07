import type {Actions} from './createActions'
import {Selectors} from './createSelectors'
import type {Cache, Key, MutationResult, Store, Typenames} from './types'
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
  actions: Actions<N, T, QP, QR, MP, MR>,
  selectors: Selectors<N, T, QP, QR, MP, MR>,
  mutationKey: MK,
  params: MK extends keyof (MP | MR) ? MP[MK] : never,
  abortControllers: WeakMap<Store, Record<Key, AbortController>>,
  onCompleted = cache.mutations[mutationKey].onCompleted,
  onSuccess = cache.mutations[mutationKey].onSuccess,
  onError = cache.mutations[mutationKey].onError
): Promise<MutationResult<MK extends keyof (MP | MR) ? MR[MK] : never>> => {
  const {updateMutationStateAndEntities} = actions

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
    }
  }

  const abortController = new AbortController()
  abortControllersOfStore[mutationKey] = abortController

  const mutatePromise = cache.mutations[mutationKey].mutation(
    // @ts-expect-error fix later
    params,
    store,
    abortController.signal
  )

  store.dispatch(
    updateMutationStateAndEntities(mutationKey as keyof (MP | MR), {
      // @ts-expect-error TODO fix types
      loading: mutatePromise,
      params,
      result: undefined,
    })
  )

  let response
  let error
  try {
    response = await mutatePromise
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
        loading: undefined,
      })
    )

    // @ts-expect-error params
    if (!onError?.(error, params, store, actions, selectors)) {
      cache.globals.onError?.(
        error,
        // @ts-expect-error mutationKey
        mutationKey,
        params,
        store,
        actions,
        selectors
      )
    }
    onCompleted?.(
      // @ts-expect-error response
      response,
      error,
      params,
      store,
      actions,
      selectors
    )

    return {error}
  }

  if (response) {
    const newState = {
      error: undefined,
      loading: undefined,
      result: response.result,
    }

    store.dispatch(updateMutationStateAndEntities(mutationKey as keyof (MP | MR), newState, response))
    onSuccess?.(
      // @ts-expect-error response
      response,
      params,
      store,
      actions,
      selectors
    )
    onCompleted?.(
      // @ts-expect-error response
      response,
      error,
      params,
      store,
      actions,
      selectors
    )

    // @ts-expect-error fix later
    return {result: response.result}
  }

  throw new Error(`${logTag}: both error and response are not defined`)
}

const ABORTED_RESULT = Object.freeze({aborted: true})
