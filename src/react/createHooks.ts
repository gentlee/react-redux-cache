import {useMemo} from 'react'

import {createClient} from '../createClient'
import {CacheToPrivate} from '../private-types'
import {Cache, Key, Typenames} from '../types'
import {validateStoreHooks} from '../utilsAndConstants'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'

export const createHooks = <N extends string, T extends Typenames, QP, QR, MP, MR>(
  cache: Cache<N, T, QP, QR, MP, MR>,
) => {
  const privateCache = cache as CacheToPrivate<typeof cache>
  const {
    config: {options},
    selectors: {selectEntitiesByTypename, selectEntityById},
    storeHooks,
  } = privateCache

  validateStoreHooks(storeHooks)

  return {
    /** Returns memoized object with query and mutate functions. Memoization dependency is the store. */
    useClient: () => {
      const innerStore = storeHooks!.useStore()
      const externalStore = storeHooks!.useExternalStore()
      return useMemo(() => createClient(privateCache, innerStore, externalStore), [externalStore, innerStore])
    },
    /** Fetches query when params change and subscribes to query state changes (subscription depends on `selectorComparer`). */
    useQuery: <QK extends keyof (QP & QR)>(
      options: Parameters<typeof useQuery<N, T, QP, QR, MP, MR, QK>>[1],
    ) => useQuery(privateCache, options),
    /** Subscribes to provided mutation state and provides mutate function. */
    useMutation: <MK extends keyof (MP & MR)>(
      options: Parameters<typeof useMutation<N, T, QP, QR, MP, MR, MK>>[1],
    ) => useMutation(privateCache, options),
    /** useSelector + selectEntityById. */
    useSelectEntityById: <TN extends keyof T>(
      id: Key | null | undefined,
      typename: TN,
    ): T[TN] | undefined => {
      return storeHooks!.useSelector((state: unknown) => selectEntityById(state, id, typename))
    },
    /**
     * useSelector + selectEntitiesByTypename. Also subscribes to collection's change key if `mutableCollections` enabled.
     * @warning Subscribing to collections should be avoided.
     * */
    useEntitiesByTypename: <TN extends keyof T>(typename: TN) => {
      if (options.mutableCollections) {
        storeHooks!.useSelector((state) => selectEntitiesByTypename(state, typename)?._changeKey)
      }
      return storeHooks!.useSelector((state) => selectEntitiesByTypename(state, typename))
    },
  }
}
