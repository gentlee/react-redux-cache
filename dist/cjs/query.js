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
const query = (logTag, store, cache, actions, selectors, queryKey, cacheKey, params, secondsToLive, onlyIfExpired, skipFetch, mergeResults, onCompleted, onSuccess, onError) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    if (secondsToLive === void 0) { secondsToLive = (_a = cache.queries[queryKey].secondsToLive) !== null && _a !== void 0 ? _a : cache.globals.queries.secondsToLive; }
    if (mergeResults === void 0) { mergeResults = cache.queries[queryKey].mergeResults; }
    if (onCompleted === void 0) { onCompleted = cache.queries[queryKey].onCompleted; }
    if (onSuccess === void 0) { onSuccess = cache.queries[queryKey].onSuccess; }
    if (onError === void 0) { onError = cache.queries[queryKey].onError; }
    const { selectQueryResult, selectQueryState } = selectors;
    const logsEnabled = cache.options.logsEnabled;
    const queryStateOnStart = selectQueryState(store.getState(), queryKey, cacheKey);
    if (skipFetch) {
        return { result: queryStateOnStart.result };
    }
    if (queryStateOnStart === null || queryStateOnStart === void 0 ? void 0 : queryStateOnStart.loading) {
        logsEnabled &&
            (0, utilsAndConstants_1.logDebug)(`${logTag} fetch cancelled: already loading`, { queryStateOnStart, params, cacheKey });
        const error = yield queryStateOnStart.loading.then(utilsAndConstants_1.noop).catch(catchAndReturn);
        const result = selectQueryResult(store.getState(), queryKey, cacheKey);
        const cancelled = 'loading';
        return error ? { cancelled, result, error } : { cancelled, result };
    }
    if (onlyIfExpired && (queryStateOnStart === null || queryStateOnStart === void 0 ? void 0 : queryStateOnStart.expiresAt) != null && queryStateOnStart.expiresAt > Date.now()) {
        logsEnabled &&
            (0, utilsAndConstants_1.logDebug)(`${logTag} fetch cancelled: not expired yet`, {
                queryStateOnStart,
                params,
                cacheKey,
                onlyIfExpired,
            });
        return { cancelled: 'not-expired', result: queryStateOnStart.result };
    }
    const { updateQueryStateAndEntities } = actions;
    const fetchPromise = cache.queries[queryKey].query(params, store);
    store.dispatch(updateQueryStateAndEntities(queryKey, cacheKey, {
        loading: fetchPromise,
        params,
    }));
    logsEnabled && (0, utilsAndConstants_1.logDebug)(`${logTag} started`, { queryKey, params, cacheKey, queryStateOnStart, onlyIfExpired });
    let response;
    try {
        response = yield fetchPromise;
    }
    catch (error) {
        store.dispatch(updateQueryStateAndEntities(queryKey, cacheKey, {
            error: error,
            loading: undefined,
        }));
        if (!(onError === null || onError === void 0 ? void 0 : onError(error, params, store))) {
            (_c = (_b = cache.globals).onError) === null || _c === void 0 ? void 0 : _c.call(_b, error, queryKey, params, store, actions, selectors);
        }
        onCompleted === null || onCompleted === void 0 ? void 0 : onCompleted(undefined, error, params, store, actions, selectors);
        return { error, result: selectQueryResult(store.getState(), queryKey, cacheKey) };
    }
    const newState = {
        error: undefined,
        loading: undefined,
        expiresAt: (_d = response.expiresAt) !== null && _d !== void 0 ? _d : (secondsToLive != null ? Date.now() + secondsToLive * 1000 : undefined),
        result: mergeResults
            ? mergeResults(selectQueryResult(store.getState(), queryKey, cacheKey), response, params, store, actions, selectors)
            : response.result,
    };
    store.dispatch(updateQueryStateAndEntities(queryKey, cacheKey, newState, response));
    onSuccess === null || onSuccess === void 0 ? void 0 : onSuccess(response, params, store, actions, selectors);
    onCompleted === null || onCompleted === void 0 ? void 0 : onCompleted(response, undefined, params, store, actions, selectors);
    return { result: newState === null || newState === void 0 ? void 0 : newState.result };
});
exports.query = query;
const catchAndReturn = (x) => x;
