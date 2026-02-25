import {Actions} from './createActions'
import {createClient} from './createClient'
import {CachePrivate, CacheToPrivate, InnerStore} from './private-types'
import {Cache, CacheState, Typenames, ZustandStoreLike} from './types'
import {EMPTY_OBJECT, isRootState, logWarn} from './utilsAndConstants'

export const initializeForZustand = <N extends string, T extends Typenames, QP, QR, MP, MR, S = unknown>(
  cache: Cache<N, T, QP, QR, MP, MR>,
  store: ZustandStoreLike<S>,
) => {
  type TypedActions = Actions<N, T, QP, QR, MP, MR>

  const privateCache = cache as CachePrivate<N, T, QP, QR, MP, MR>

  const {
    config: {cacheStateKey},
    reducer,
    actions,
    selectors: {selectCacheState},
  } = privateCache

  const getStateToMerge: (cacheState: CacheState<T, QP, QR, MP, MR>) => S = isRootState(cacheStateKey)
    ? (state) => state as S
    : (state: CacheState<T, QP, QR, MP, MR>) => ({[cacheStateKey]: state}) as S

  const dispatch = (action: Actions<N, T, QP, QR, MP, MR>[keyof Actions]) => {
    const state = reducer(
      selectCacheState(store.getState()),
      // @ts-expect-error TODO fix types
      action,
    )
    store.setState(getStateToMerge(state))
  }

  if (privateCache.storeHooks !== undefined) {
    logWarn('initializeForZustand', 'Cache seems to be already initialized')
  }

  const innerStore: InnerStore = {dispatch, getState: store.getState}
  privateCache.storeHooks = {
    useStore: () => innerStore,
    useSelector: store,
    useExternalStore: () => store,
  }

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

  const getInitialState = () => {
    const {reducer} = cache as CacheToPrivate<typeof cache>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state = reducer(undefined, EMPTY_OBJECT as any)
    return getStateToMerge(state)
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
      /** Generates the initial state. */
      getInitialState,
      /** Creates client by providing the store. Can be used when the store is a singleton for direct client import. */
      createClient: (store: ZustandStoreLike) => createClient(privateCache, innerStore, store),
    },
  }
}
