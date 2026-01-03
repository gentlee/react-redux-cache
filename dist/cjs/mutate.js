"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mutate = void 0;
const utilsAndConstants_1 = require("./utilsAndConstants");
const mutate = (logTag_1, store_1, cache_1, actions_1, selectors_1, mutationKey_1, params_1, abortControllers_1, ...args_1) => __awaiter(void 0, [logTag_1, store_1, cache_1, actions_1, selectors_1, mutationKey_1, params_1, abortControllers_1, ...args_1], void 0, function* (logTag, store, cache, actions, selectors, mutationKey, params, abortControllers, onCompleted = cache.mutations[mutationKey].onCompleted, onSuccess = cache.mutations[mutationKey].onSuccess, onError = cache.mutations[mutationKey].onError) {
    var _a, _b;
    const { updateMutationStateAndEntities } = actions;
    let abortControllersOfStore = abortControllers.get(store);
    if (abortControllersOfStore === undefined) {
        abortControllersOfStore = {};
        abortControllers.set(store, abortControllersOfStore);
    }
    {
        const abortController = abortControllersOfStore[mutationKey];
        cache.options.logsEnabled &&
            (0, utilsAndConstants_1.logDebug)(logTag, { mutationKey, params, previousAborted: abortController !== undefined });
        if (abortController !== undefined) {
            abortController.abort();
        }
    }
    const abortController = new AbortController();
    abortControllersOfStore[mutationKey] = abortController;
    const mutatePromise = cache.mutations[mutationKey].mutation(params, store, abortController.signal);
    store.dispatch(updateMutationStateAndEntities(mutationKey, {
        loading: mutatePromise,
        params,
        result: undefined,
    }));
    let response;
    let error;
    try {
        response = yield mutatePromise;
    }
    catch (e) {
        error = e;
    }
    cache.options.logsEnabled &&
        (0, utilsAndConstants_1.logDebug)(`${logTag} finished`, { response, error, aborted: abortController.signal.aborted });
    if (abortController.signal.aborted) {
        return ABORTED_RESULT;
    }
    delete abortControllersOfStore[mutationKey];
    if (error) {
        store.dispatch(updateMutationStateAndEntities(mutationKey, {
            error: error,
            loading: undefined,
        }));
        if (!(onError === null || onError === void 0 ? void 0 : onError(error, params, store, actions, selectors))) {
            (_b = (_a = cache.globals).onError) === null || _b === void 0 ? void 0 : _b.call(_a, error, mutationKey, params, store, actions, selectors);
        }
        onCompleted === null || onCompleted === void 0 ? void 0 : onCompleted(response, error, params, store, actions, selectors);
        return { error };
    }
    if (response) {
        const newState = {
            error: undefined,
            loading: undefined,
            result: response.result,
        };
        store.dispatch(updateMutationStateAndEntities(mutationKey, newState, response));
        onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(response, params, store, actions, selectors);
        onCompleted === null || onCompleted === void 0 ? void 0 : onCompleted(response, error, params, store, actions, selectors);
        return { result: response.result };
    }
    throw new Error(`${logTag}: both error and response are not defined`);
});
exports.mutate = mutate;
const ABORTED_RESULT = Object.freeze({ aborted: true });
