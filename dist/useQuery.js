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
exports.useQuery = void 0;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const query_1 = require("./query");
const utilsAndConstants_1 = require("./utilsAndConstants");
const useQuery = (cache, actions, options) => {
    var _a, _b, _c;
    const { query: queryKey, skip, params, secondsToLive, cachePolicy = (_a = cache.queries[queryKey].cachePolicy) !== null && _a !== void 0 ? _a : cache.globals.cachePolicy, mergeResults, onCompleted, onSuccess, onError, } = options;
    const logsEnabled = cache.options.logsEnabled;
    const getCacheKey = (_b = cache.queries[queryKey].getCacheKey) !== null && _b !== void 0 ? _b : (utilsAndConstants_1.defaultGetCacheKey);
    const cacheStateSelector = cache.cacheStateSelector;
    const store = (0, react_redux_1.useStore)();
    // @ts-expect-error fix types later
    const cacheKey = getCacheKey(params);
    /** Fetch query with the new parameters, or refetch with the same if parameters not provided. */
    const fetch = (0, react_1.useCallback)((options) => __awaiter(void 0, void 0, void 0, function* () {
        const paramsPassed = options && 'params' in options;
        return yield (0, query_1.query)('useQuery.fetch', store, cache, actions, queryKey, 
        // @ts-expect-error fix later
        paramsPassed ? getCacheKey(options.params) : cacheKey, paramsPassed ? options.params : params, // params type can also have null | undefined, thats why we don't check for it here
        secondsToLive, options === null || options === void 0 ? void 0 : options.onlyIfExpired, 
        // @ts-expect-error fix later
        mergeResults, onCompleted, onSuccess, onError);
    }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, queryKey, cacheKey]);
    /** Query state */
    const queryState = (_c = (0, react_redux_1.useSelector)((state) => {
        const queryState = cacheStateSelector(state).queries[queryKey][cacheKey];
        return queryState; // TODO proper type
    }, (useQueryStateComparer))) !== null && _c !== void 0 ? _c : utilsAndConstants_1.EMPTY_OBJECT;
    (0, react_1.useEffect)(() => {
        if (skip) {
            logsEnabled && (0, utilsAndConstants_1.log)('useQuery.useEffect skip fetch', { skip, cacheKey });
            return;
        }
        if (queryState.result != null &&
            cachePolicy === 'cache-first' &&
            (queryState.expiresAt == null || queryState.expiresAt > Date.now())) {
            logsEnabled &&
                (0, utilsAndConstants_1.log)('useQuery.useEffect no fetch due to cache policy', {
                    result: queryState.result,
                    expiresAt: queryState.expiresAt,
                    now: Date.now(),
                    cachePolicy,
                });
            return;
        }
        fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheKey, cachePolicy, skip]);
    logsEnabled &&
        (0, utilsAndConstants_1.log)('useQuery', {
            cacheKey,
            options,
            queryState,
        });
    return [queryState, fetch];
};
exports.useQuery = useQuery;
/** Omit `expiresAt` from comparison */
const useQueryStateComparer = (state1, state2) => {
    if (state1 === state2) {
        return true;
    }
    if (state1 === undefined || state2 === undefined) {
        return false;
    }
    return (state1.error === state2.error &&
        state1.loading === state2.loading &&
        state1.params === state2.params &&
        state1.result === state2.result);
};
