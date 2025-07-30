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
import {useMemo} from 'react'

import {mutate as mutateImpl} from './mutate'
import {EMPTY_OBJECT, logDebug} from './utilsAndConstants'

export const useMutation = (cache, actions, selectors, options, abortControllers) => {
  var _a
  const {selectMutationState} = selectors
  const {updateMutationStateAndEntities} = actions
  const {mutation: mutationKey, onCompleted, onSuccess, onError} = options
  const store = cache.storeHooks.useStore()
  const [mutationStateSelector, mutate, abort] = useMemo(() => {
    return [
      (state) => selectMutationState(state, mutationKey),
      (params) =>
        __awaiter(void 0, void 0, void 0, function* () {
          return yield mutateImpl(
            'useMutation.mutate',
            store,
            cache,
            actions,
            selectors,
            mutationKey,
            params,
            abortControllers,
            onCompleted,
            onSuccess,
            onError
          )
        }),
      () => {
        var _a
        const abortController =
          (_a = abortControllers.get(store)) === null || _a === void 0 ? void 0 : _a[mutationKey]
        if (abortController === undefined || abortController.signal.aborted) {
          return false
        }
        abortController.abort()
        store.dispatch(updateMutationStateAndEntities(mutationKey, {loading: undefined}))
        return true
      },
    ]
  }, [mutationKey, store])
  const mutationState =
    (_a = cache.storeHooks.useSelector(mutationStateSelector)) !== null && _a !== void 0 ? _a : EMPTY_OBJECT
  cache.options.logsEnabled && logDebug('useMutation', {options, mutationState})
  return [mutate, mutationState, abort]
}
