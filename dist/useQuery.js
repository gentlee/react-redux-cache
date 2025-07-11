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
exports.useQuerySelectorStateComparer = exports.useQuery = void 0;
const react_1 = require("react");
const query_1 = require("./query");
const utilsAndConstants_1 = require("./utilsAndConstants");
const useQuery = (cache, actions, selectors, options) => {
    var _a, _b, _c;
    const { query: queryKey, skipFetch = false, params, secondsToLive, fetchPolicy = (_a = cache.queries[queryKey].fetchPolicy) !== null && _a !== void 0 ? _a : cache.globals.queries.fetchPolicy, mergeResults, onCompleted, onSuccess, onError, } = options;
    const { selectQueryState } = selectors;
    const logsEnabled = cache.options.logsEnabled;
    const getCacheKey = (_b = cache.queries[queryKey].getCacheKey) !== null && _b !== void 0 ? _b : (utilsAndConstants_1.defaultGetCacheKey);
    const store = cache.storeHooks.useStore();
    // @ts-expect-error fix types later
    const cacheKey = getCacheKey(params);
    /** Fetch query with the new parameters, or refetch with the same if parameters not provided. */
    const performFetch = (0, react_1.useCallback)((options) => __awaiter(void 0, void 0, void 0, function* () {
        const paramsPassed = options && 'params' in options;
        return yield (0, query_1.query)('useQuery.fetch', store, cache, actions, selectors, queryKey, 
        // @ts-expect-error fix later
        paramsPassed ? getCacheKey(options.params) : cacheKey, paramsPassed ? options.params : params, // params type can also have null | undefined, thats why we don't check for it here
        secondsToLive, options === null || options === void 0 ? void 0 : options.onlyIfExpired, 
        // @ts-expect-error fix later
        mergeResults, onCompleted, onSuccess, onError);
    }), 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [store, queryKey, cacheKey]);
    /** Query state */
    const queryState = (_c = cache.storeHooks.useSelector((state) => {
        return selectQueryState(state, queryKey, cacheKey); // TODO proper type
    }, (exports.useQuerySelectorStateComparer))) !== null && _c !== void 0 ? _c : utilsAndConstants_1.EMPTY_OBJECT;
    (0, react_1.useEffect)(() => {
        if (skipFetch) {
            logsEnabled && (0, utilsAndConstants_1.log)('useQuery.useEffect skip fetch', { skipFetch, queryKey, cacheKey });
            return;
        }
        const expired = queryState.expiresAt != null && queryState.expiresAt <= Date.now();
        if (!fetchPolicy(expired, 
        // @ts-expect-error params
        params, queryState, store, selectors)) {
            logsEnabled &&
                (0, utilsAndConstants_1.log)('useQuery.useEffect skip fetch due to fetch policy', {
                    queryState,
                    expired,
                    queryKey,
                    cacheKey,
                });
            return;
        }
        performFetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheKey, skipFetch]);
    logsEnabled &&
        (0, utilsAndConstants_1.log)('useQuery', {
            cacheKey,
            options,
            queryState,
        });
    return [queryState, performFetch];
};
exports.useQuery = useQuery;
/** Omit `expiresAt` from comparison */
const useQuerySelectorStateComparer = (state1, state2) => {
    if (state1 === state2) {
        return true;
    }
    if (state1 === undefined || state2 === undefined) {
        return false;
    }
    return (state1.params === state2.params &&
        state1.loading === state2.loading &&
        state1.result === state2.result &&
        state1.error === state2.error);
};
exports.useQuerySelectorStateComparer = useQuerySelectorStateComparer;
