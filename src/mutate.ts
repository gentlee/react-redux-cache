import {Store} from 'redux'

import {setMutationStateAndEntities} from './reducer'
import {Cache, Key, MutationCacheOptions, MutationResult, Typenames} from './types'
import {log} from './utilsAndConstants'

export const mutate = async <T extends Typenames, QP, QR, MP, MR, MK extends keyof (MP & MR)>(
  logTag: string,
  returnResult: boolean,
  store: Store,
  cache: Cache<T, QP, QR, MP, MR>,
  mutationKey: MK,
  cacheOptions: MutationCacheOptions,
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
      cacheOptions.cacheMutationState &&
        store.dispatch(
          setMutationStateAndEntities<T, MR, keyof MR>(mutationKey as keyof MR, {
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
    if (cacheOptions.cacheMutationState) {
      store.dispatch(
        setMutationStateAndEntities<T, MR, keyof MR>(mutationKey as keyof MR, {
          error: error as Error,
          loading: false,
        })
      )
    }
    return {error}
  }

  if (response) {
    store.dispatch(
      setMutationStateAndEntities(
        mutationKey as keyof MR,
        cacheOptions.cacheMutationState
          ? {
              error: undefined,
              loading: false,
              // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
              result: response.result,
            }
          : undefined,
        cacheOptions.cacheEntities ? response : undefined
      )
    )
    // @ts-expect-error fix later
    return returnResult ? {result: response.result} : undefined
  }

  throw new Error(`${logTag}: both error and response are not defined`)
}
