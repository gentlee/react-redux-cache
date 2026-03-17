import {Actions} from '../createActions'
import {createClient as createClientImpl} from '../createClient'
import {Cache, Typenames, ZustandStoreLike} from '../types'
import {CacheExtensions, CachePrivate} from '../typesPrivate'
import {logDebug, logWarn} from '../utilsAndConstants'

/** Initializes cache for Zustand, returning actions and utils. */
export const initializeForZustand = <
  N extends string,
  SK extends string,
  T extends Typenames,
  QP,
  QR,
  MP,
  MR,
  S = unknown,
>(
  cache: Cache<N, SK, T, QP, QR, MP, MR>,
  store: ZustandStoreLike<S>,
) => {
  type TypedActions = Actions<N, T, QP, QR, MP, MR>

  const privateCache = cache as CachePrivate<N, SK, T, QP, QR, MP, MR>
  const {
    config: {
      options: {logsEnabled},
    },
    reducer,
    actions,
    selectors: {selectCacheState},
    utils: {getRootState},
  } = privateCache

  const dispatch = (action: Actions<N, T, QP, QR, MP, MR>[keyof Actions]) => {
    const state = reducer(
      selectCacheState(store.getState()),
      // @ts-expect-error TODO fix types
      action,
    )
    store.setState(getRootState(state) as S)
  }

  const innerStore = {dispatch, getState: store.getState}
  privateCache.extensions ??= {}
  if (privateCache.extensions.zustand !== undefined) {
    logWarn('initializeForZustand', 'Already initialized for Zustand')
  }
  privateCache.extensions.zustand ??= {} as NonNullable<CacheExtensions['zustand']>
  privateCache.extensions.zustand.innerStore = innerStore
  privateCache.extensions.zustand.externalStore = store
  logsEnabled && logDebug('initializeForZustand', 'Initialized for Zustand')

  // Bind actions to dispatch

  const {
    clearCache,
    clearMutationState,
    clearQueryState,
    invalidateQuery,
    mergeEntityChanges,
    updateMutationStateAndEntities,
    updateQueryStateAndEntities,
  } = (Object.keys(actions) as (keyof TypedActions)[]).reduce(
    (result, key) => {
      const fn = actions[key]
      result[key] = function () {
        // @ts-expect-error TODO fix types
        const action = fn.apply(undefined, arguments)
        // @ts-expect-error TODO fix types
        return dispatch(action)
      }
      return result
    },
    {} as {[key in keyof TypedActions]: (...args: Parameters<TypedActions[key]>) => void},
  )

  // Utils

  const createClient = () => {
    return createClientImpl(privateCache, innerStore, store)
  }

  return {
    // doc-header
    actions: {
      /** Updates query state, and optionally merges entity changes in a single action. */
      updateQueryStateAndEntities,
      /** Updates mutation state, and optionally merges entity changes in a single action. */
      updateMutationStateAndEntities,
      /** Merges EntityChanges to the state. */
      mergeEntityChanges,
      /** Sets expiresAt to Date.now(). */
      invalidateQuery,
      /** Clears states for provided query keys and cache keys.
       * If cache key for query key is not provided, the whole state for query key is cleared. */
      clearQueryState,
      /** Clears states for provided mutation keys. */
      clearMutationState,
      /** Replaces cache state with initial, optionally merging with provided state. Doesn't cancel running fetches and should be used with caution. */
      clearCache,
    } satisfies Record<keyof TypedActions, unknown>,
    // doc-header
    utils: {
      /** Creates client by providing the store. Can be used when the store is a singleton for direct client import. */
      createClient,
    },
  }
}
