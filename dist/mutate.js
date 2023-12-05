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
exports.mutate = exports.getAbortController = exports.abortControllers = void 0;
const reducer_1 = require("./reducer");
const utilsAndConstants_1 = require("./utilsAndConstants");
exports.abortControllers = new WeakMap();
const getAbortController = (store, mutationKey) => { var _a; return (_a = exports.abortControllers.get(store)) === null || _a === void 0 ? void 0 : _a[mutationKey]; };
exports.getAbortController = getAbortController;
const mutate = (logTag, returnResult, store, cache, mutationKey, cacheOptions, params) => __awaiter(void 0, void 0, void 0, function* () {
    let abortControllersOfStore = exports.abortControllers.get(store);
    if (abortControllersOfStore === undefined) {
        abortControllersOfStore = {};
        exports.abortControllers.set(store, abortControllersOfStore);
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
            cacheOptions.cacheMutationState &&
                store.dispatch((0, reducer_1.setMutationStateAndEntities)(mutationKey, {
                    loading: true,
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
        params, abortController.signal);
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
        return returnResult ? { aborted: true } : undefined;
    }
    delete abortControllersOfStore[mutationKey];
    if (error) {
        if (cacheOptions.cacheMutationState) {
            store.dispatch((0, reducer_1.setMutationStateAndEntities)(mutationKey, {
                error: error,
                loading: false,
            }));
        }
        return { error };
    }
    if (response) {
        store.dispatch((0, reducer_1.setMutationStateAndEntities)(mutationKey, cacheOptions.cacheMutationState
            ? {
                error: undefined,
                loading: false,
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                result: response.result,
            }
            : undefined, cacheOptions.cacheEntities ? response : undefined));
        // @ts-expect-error fix later
        return returnResult ? { result: response.result } : undefined;
    }
    throw new Error(`${logTag}: both error and response are not defined`);
});
exports.mutate = mutate;
