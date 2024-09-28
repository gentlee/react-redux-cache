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
const query = (logTag, store, cache, { updateQueryStateAndEntities, }, queryKey, cacheKey, params, secondsToLive = cache.queries[queryKey].secondsToLive, onlyIfExpired) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    const logsEnabled = cache.options.logsEnabled;
    const cacheStateSelector = cache.cacheStateSelector;
    const { mergeResults } = cache.queries[queryKey];
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
    if (onlyIfExpired && (queryStateOnStart === null || queryStateOnStart === void 0 ? void 0 : queryStateOnStart.expiresAt) != null && queryStateOnStart.expiresAt > Date.now()) {
        logsEnabled &&
            (0, utilsAndConstants_1.log)(`${logTag} cancelled: not expired yet`, {
                queryStateOnStart,
                params,
                cacheKey,
                onlyIfExpired,
            });
        return CANCELLED_RESULT;
    }
    store.dispatch(updateQueryStateAndEntities(queryKey, cacheKey, {
        loading: true,
        params,
    }));
    logsEnabled && (0, utilsAndConstants_1.log)(`${logTag} started`, { queryKey, params, cacheKey, queryStateOnStart, onlyIfExpired });
    let response;
    const fetchFn = cache.queries[queryKey].query;
    try {
        response = yield fetchFn(
        // @ts-expect-error fix later
        params, store);
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
        expiresAt: (_a = response.expiresAt) !== null && _a !== void 0 ? _a : (secondsToLive != null ? Date.now() + secondsToLive * 1000 : undefined),
        result: mergeResults
            ? mergeResults(
            // @ts-expect-error fix later
            (_b = cacheStateSelector(store.getState()).queries[queryKey][cacheKey]) === null || _b === void 0 ? void 0 : _b.result, response, params, store)
            : response.result,
    };
    // React 18 automatically batches all state updates, no need for optimization here
    store.dispatch(updateQueryStateAndEntities(queryKey, cacheKey, newState, response));
    (_c = response.actions) === null || _c === void 0 ? void 0 : _c.forEach(store.dispatch);
    return {
        // @ts-expect-error fix types
        result: newState === null || newState === void 0 ? void 0 : newState.result,
    };
});
exports.query = query;
const CANCELLED_RESULT = Object.freeze({ cancelled: true });
