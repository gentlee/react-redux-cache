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
  returnResult: boolean,
  store: Store,
  cache: Cache<N, T, QP, QR, MP, MR>,
  {updateMutationStateAndEntities}: Pick<ActionMap<N, T, QR, MR>, 'updateMutationStateAndEntities'>,
  mutationKey: MK,
  params: MK extends keyof (MP | MR) ? MP[MK] : never,
  abortControllers: WeakMap<Store, Record<Key, AbortController>>
): Promise<void | MutationResult<MK extends keyof (MP | MR) ? MR[MK] : never>> => {
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
        updateMutationStateAndEntities(mutationKey as keyof MR, {
          loading: true,
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
    return returnResult ? {aborted: true} : undefined
  }

  delete abortControllersOfStore[mutationKey]

  if (error) {
    store.dispatch(
      updateMutationStateAndEntities(mutationKey as keyof MR, {
        error: error as Error,
        loading: false,
      })
    )
    return {error}
  }

  if (response) {
    store.dispatch(
      updateMutationStateAndEntities(
        mutationKey as keyof MR,
        {
          error: undefined,
          loading: false,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          result: response.result,
        },
        response
      )
    )
    // @ts-expect-error fix later
    return returnResult ? {result: response.result} : undefined
  }

  throw new Error(`${logTag}: both error and response are not defined`)
}
