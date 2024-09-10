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
const mutate = (logTag, store, cache, { updateMutationStateAndEntities, }, mutationKey, params, abortControllers) => __awaiter(void 0, void 0, void 0, function* () {
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
        return ABORTED_RESULT;
    }
    delete abortControllersOfStore[mutationKey];
    if (error) {
        store.dispatch(updateMutationStateAndEntities(mutationKey, {
            error: error,
            loading: false,
        }));
        return { error };
    }
    if (response) {
        store.dispatch(updateMutationStateAndEntities(mutationKey, {
            error: undefined,
            loading: false,
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            result: response.result,
        }, response));
        // @ts-expect-error fix later
        return { result: response.result };
    }
    throw new Error(`${logTag}: both error and response are not defined`);
});
exports.mutate = mutate;
const ABORTED_RESULT = Object.freeze({ aborted: true });
