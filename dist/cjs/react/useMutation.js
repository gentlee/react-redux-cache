'use strict'
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value)
          })
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value))
        } catch (e) {
          reject(e)
        }
      }
      function rejected(value) {
        try {
          step(generator['throw'](value))
        } catch (e) {
          reject(e)
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected)
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next())
    })
  }
Object.defineProperty(exports, '__esModule', {value: true})
exports.useMutation = void 0
const react_1 = require('react')
const mutate_1 = require('../mutate')
const utilsAndConstants_1 = require('../utilsAndConstants')
const useMutation = (cache, options) => {
  var _a
  const {
    config,
    storeHooks,
    abortControllers,
    selectors: {selectMutationState},
    actions: {updateMutationStateAndEntities},
  } = cache
  const {mutation: mutationKey, onCompleted, onSuccess, onError} = options
  ;(0, utilsAndConstants_1.validateStoreHooks)(storeHooks)
  const innerStore = storeHooks.useStore()
  const externalStore = storeHooks.useExternalStore()
  const [mutationStateSelector, mutate, abort] = (0, react_1.useMemo)(() => {
    const mutationStateSelectorFromUseMutation = (state) => selectMutationState(state, mutationKey)
    const mutateFromUseMutation = (params) =>
      __awaiter(void 0, void 0, void 0, function* () {
        return (0, mutate_1.mutate)(
          'useMutation.mutate',
          innerStore,
          externalStore,
          cache,
          mutationKey,
          params,
          onCompleted,
          onSuccess,
          onError,
        )
      })
    const abortFromUseMutation = () => {
      var _a
      const abortController =
        (_a = abortControllers.get(innerStore)) === null || _a === void 0 ? void 0 : _a[mutationKey]
      if (abortController === undefined || abortController.signal.aborted) {
        return false
      }
      abortController.abort()
      innerStore.dispatch(updateMutationStateAndEntities(mutationKey, {loading: undefined}))
      return true
    }
    return [mutationStateSelectorFromUseMutation, mutateFromUseMutation, abortFromUseMutation]
  }, [mutationKey, innerStore, externalStore])
  const mutationState =
    (_a = storeHooks.useSelector(mutationStateSelector)) !== null && _a !== void 0
      ? _a
      : utilsAndConstants_1.EMPTY_OBJECT
  config.options.logsEnabled && (0, utilsAndConstants_1.logDebug)('useMutation', {options, mutationState})
  return [mutate, mutationState, abort]
}
exports.useMutation = useMutation
