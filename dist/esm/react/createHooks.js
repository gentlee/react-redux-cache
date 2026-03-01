import {useMemo} from 'react'

import {createClient} from '../createClient'
import {validateStoreHooks} from '../utilsAndConstants'
import {useMutation} from './useMutation'
import {useQuery} from './useQuery'

export const createHooks = (cache) => {
  const privateCache = cache
  const {
    config: {options},
    selectors: {selectEntitiesByTypename, selectEntityById},
    storeHooks,
  } = privateCache
  validateStoreHooks(storeHooks)
  return {
    useClient: () => {
      const innerStore = storeHooks.useStore()
      const externalStore = storeHooks.useExternalStore()
      return useMemo(() => createClient(privateCache, innerStore, externalStore), [externalStore, innerStore])
    },
    useQuery: (options) => useQuery(privateCache, options),
    useMutation: (options) => useMutation(privateCache, options),
    useSelectEntityById: (id, typename) => {
      return storeHooks.useSelector((state) => selectEntityById(state, id, typename))
    },
    useEntitiesByTypename: (typename) => {
      if (options.mutableCollections) {
        storeHooks.useSelector((state) => {
          var _a
          return (_a = selectEntitiesByTypename(state, typename)) === null || _a === void 0
            ? void 0
            : _a._changeKey
        })
      }
      return storeHooks.useSelector((state) => selectEntitiesByTypename(state, typename))
    },
  }
}
