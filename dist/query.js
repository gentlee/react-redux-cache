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
exports.query = void 0;
const utilsAndConstants_1 = require("./utilsAndConstants");
const query = (logTag, store, cache, { updateQueryStateAndEntities }, queryKey, cacheKey, params) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const logsEnabled = cache.options.logsEnabled;
    const cacheStateSelector = cache.cacheStateSelector;
    const cacheResultSelector = cache.queries[queryKey].resultSelector;
    const mergeResults = cache.queries[queryKey].mergeResults;
    const queryStateOnStart = cacheStateSelector(store.getState()).queries[queryKey][cacheKey];
    if (queryStateOnStart === null || queryStateOnStart === void 0 ? void 0 : queryStateOnStart.loading) {
        logsEnabled &&
            (0, utilsAndConstants_1.log)(`${logTag} cancelled: already loading`, {
                queryStateOnStart,
                params,
                cacheKey,
            });
        return CANCELLED_RESULT;
    }
    store.dispatch(updateQueryStateAndEntities(queryKey, cacheKey, {
        loading: true,
    }));
    logsEnabled && (0, utilsAndConstants_1.log)(`${logTag} started`, { queryStateOnStart, params, cacheKey });
    let response;
    const fetchFn = cache.queries[queryKey].query;
    try {
        response = yield fetchFn(
        // @ts-expect-error fix later
        params);
    }
    catch (error) {
        store.dispatch(updateQueryStateAndEntities(queryKey, cacheKey, {
            error: error,
            loading: false,
        }));
        return { error };
    }
    const newState = {
        error: undefined,
        loading: false,
        result: cacheResultSelector
            ? undefined
            : mergeResults
                ? mergeResults(
                // @ts-expect-error fix later
                (_a = cacheStateSelector(store.getState()).queries[queryKey][cacheKey]) === null || _a === void 0 ? void 0 : _a.result, response, params, store)
                : response.result,
    };
    store.dispatch(updateQueryStateAndEntities(queryKey, cacheKey, newState, response));
    return {
        // @ts-expect-error fix types
        result: cacheResultSelector
            ? cacheResultSelector(cacheStateSelector(store.getState()), 
            // @ts-expect-error fix types
            params)
            : newState === null || newState === void 0 ? void 0 : newState.result,
    };
});
exports.query = query;
const CANCELLED_RESULT = Object.freeze({ cancelled: true });
