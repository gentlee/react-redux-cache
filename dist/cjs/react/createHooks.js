'use strict'
Object.defineProperty(exports, '__esModule', {value: true})
exports.createHooks = void 0
const react_1 = require('react')
const createClient_1 = require('../createClient')
const utilsAndConstants_1 = require('../utilsAndConstants')
const useMutation_1 = require('./useMutation')
const useQuery_1 = require('./useQuery')
const createHooks = (cache) => {
  const privateCache = cache
  const {
    config: {options},
    selectors: {selectEntitiesByTypename, selectEntityById},
    storeHooks,
  } = privateCache
  ;(0, utilsAndConstants_1.validateStoreHooks)(storeHooks)
  return {
    useClient: () => {
      const innerStore = storeHooks.useStore()
      const externalStore = storeHooks.useExternalStore()
      return (0, react_1.useMemo)(
        () => (0, createClient_1.createClient)(privateCache, innerStore, externalStore),
        [externalStore, innerStore],
      )
    },
    useQuery: (options) => (0, useQuery_1.useQuery)(privateCache, options),
    useMutation: (options) => (0, useMutation_1.useMutation)(privateCache, options),
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
exports.createHooks = createHooks
