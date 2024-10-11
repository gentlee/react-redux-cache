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
const mutate = (logTag_1, store_1, cache_1, _a, mutationKey_1, params_1, abortControllers_1, ...args_1) => __awaiter(void 0, [logTag_1, store_1, cache_1, _a, mutationKey_1, params_1, abortControllers_1, ...args_1], void 0, function* (logTag, store, cache, { updateMutationStateAndEntities, }, mutationKey, params, abortControllers, onCompleted = cache.mutations[mutationKey].onCompleted, onSuccess = cache.mutations[mutationKey].onSuccess, onError = cache.mutations[mutationKey].onError) {
    var _b, _c;
    let abortControllersOfStore = abortControllers.get(store);
    if (abortControllersOfStore === undefined) {
        abortControllersOfStore = {};
        abortControllers.set(store, abortControllersOfStore);
    }
    {
        const abortController = abortControllersOfStore[mutationKey];
        cache.options.logsEnabled &&
            (0, utilsAndConstants_1.log)(logTag, {
                mutationKey,
                params,
                previousAborted: abortController !== undefined,
            });
        if (abortController !== undefined) {
            abortController.abort();
        }
        else {
            store.dispatch(updateMutationStateAndEntities(mutationKey, {
                loading: true,
                params,
                result: undefined,
            }));
        }
    }
    const abortController = new AbortController();
    abortControllersOfStore[mutationKey] = abortController;
    let response;
    let error;
    const fetchFn = cache.mutations[mutationKey].mutation;
    try {
        response = yield fetchFn(
        // @ts-expect-error fix later
        params, store, abortController.signal);
    }
    catch (e) {
        error = e;
    }
    cache.options.logsEnabled &&
        (0, utilsAndConstants_1.log)(`${logTag} finished`, {
            response,
            error,
            aborted: abortController.signal.aborted,
        });
    if (abortController.signal.aborted) {
        return ABORTED_RESULT;
    }
    delete abortControllersOfStore[mutationKey];
    if (error) {
        store.dispatch(updateMutationStateAndEntities(mutationKey, {
            error: error,
            loading: false,
        }));
        // @ts-expect-error params
        if (!(onError === null || onError === void 0 ? void 0 : onError(error, params, store))) {
            // @ts-expect-error queryKey
            (_c = (_b = cache.globals).onError) === null || _c === void 0 ? void 0 : _c.call(_b, error, mutationKey, params, store);
        }
        // @ts-expect-error response
        onCompleted === null || onCompleted === void 0 ? void 0 : onCompleted(response, error, params, store);
        return { error };
    }
    if (response) {
        const newState = {
            error: undefined,
            loading: false,
            result: response.result,
        };
        store.dispatch(updateMutationStateAndEntities(mutationKey, newState, response));
        // @ts-expect-error params
        onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(response, params, store);
        // @ts-expect-error response
        onCompleted === null || onCompleted === void 0 ? void 0 : onCompleted(response, error, params, store);
        // @ts-expect-error fix later
        return { result: response.result };
    }
    throw new Error(`${logTag}: both error and response are not defined`);
});
exports.mutate = mutate;
const ABORTED_RESULT = Object.freeze({ aborted: true });
