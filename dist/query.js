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
const query = (logTag, store, cache, actions, selectors, queryKey, cacheKey, params, secondsToLive, onlyIfExpired, mergeResults, onCompleted, onSuccess, onError) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e;
    if (secondsToLive === void 0) { secondsToLive = (_a = cache.queries[queryKey].secondsToLive) !== null && _a !== void 0 ? _a : cache.globals.queries.secondsToLive; }
    if (mergeResults === void 0) { mergeResults = cache.queries[queryKey].mergeResults; }
    if (onCompleted === void 0) { onCompleted = cache.queries[queryKey].onCompleted; }
    if (onSuccess === void 0) { onSuccess = cache.queries[queryKey].onSuccess; }
    if (onError === void 0) { onError = cache.queries[queryKey].onError; }
    const logsEnabled = cache.options.logsEnabled;
    const cacheStateSelector = cache.cacheStateSelector;
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
    const { updateQueryStateAndEntities } = actions;
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
        // @ts-expect-error params
        if (!(onError === null || onError === void 0 ? void 0 : onError(error, params, store))) {
            (_c = (_b = cache.globals).onError) === null || _c === void 0 ? void 0 : _c.call(_b, error, 
            // @ts-expect-error queryKey
            queryKey, params, store, actions, selectors);
        }
        onCompleted === null || onCompleted === void 0 ? void 0 : onCompleted(undefined, error, 
        // @ts-expect-error params
        params, store, actions, selectors);
        return { error };
    }
    const newState = {
        error: undefined,
        loading: false,
        expiresAt: (_d = response.expiresAt) !== null && _d !== void 0 ? _d : (secondsToLive != null ? Date.now() + secondsToLive * 1000 : undefined),
        result: mergeResults
            ? mergeResults(
            // @ts-expect-error fix later
            (_e = cacheStateSelector(store.getState()).queries[queryKey][cacheKey]) === null || _e === void 0 ? void 0 : _e.result, response, params, store, actions, selectors)
            : response.result,
    };
    store.dispatch(updateQueryStateAndEntities(queryKey, cacheKey, newState, response));
    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(
    // @ts-expect-error response
    response, params, store, actions, selectors);
    onCompleted === null || onCompleted === void 0 ? void 0 : onCompleted(
    // @ts-expect-error response
    response, undefined, params, store, actions, selectors);
    return {
        // @ts-expect-error fix types
        result: newState === null || newState === void 0 ? void 0 : newState.result,
    };
});
exports.query = query;
const CANCELLED_RESULT = Object.freeze({ cancelled: true });
