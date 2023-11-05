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
exports.useQuery = exports.defaultQueryCacheOptions = exports.queryCacheOptionsByPolicy = void 0;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const reducer_1 = require("./reducer");
const utilsAndConstants_1 = require("./utilsAndConstants");
const cacheFirstOptions = {
    policy: 'cache-first',
    cacheQueryState: true,
    cacheEntities: true,
};
exports.queryCacheOptionsByPolicy = {
    'cache-first': cacheFirstOptions,
    'cache-and-fetch': Object.assign(Object.assign({}, cacheFirstOptions), { policy: 'cache-and-fetch' }),
};
exports.defaultQueryCacheOptions = cacheFirstOptions;
const useQuery = (cache, options) => {
    var _a, _b, _c, _d;
    const getParamsKey = (_a = cache.queries[options.query].getParamsKey) !== null && _a !== void 0 ? _a : (utilsAndConstants_1.defaultGetParamsKey);
    const { query: queryKey, skip, params: hookParams, cacheOptions: cacheOptionsOrPolicy = (_b = cache.queries[queryKey].cacheOptions) !== null && _b !== void 0 ? _b : exports.defaultQueryCacheOptions, mergeResults = cache.queries[queryKey].mergeResults, getCacheKey = (_c = cache.queries[queryKey].getCacheKey) !== null && _c !== void 0 ? _c : getParamsKey, } = options;
    const hookParamsKey = getParamsKey(
    // @ts-expect-error fix later
    hookParams);
    const cacheOptions = typeof cacheOptionsOrPolicy === 'string'
        ? exports.queryCacheOptionsByPolicy[cacheOptionsOrPolicy]
        : cacheOptionsOrPolicy;
    const store = (0, react_redux_1.useStore)();
    // Check values that should be set once.
    cache.options.validateHookArguments &&
        (() => {
            ;
            [
                ['store', store],
                ['cache', cache],
                ['cache.queries', cache.queries],
                ['cacheStateSelector', cache.cacheStateSelector],
                ['cacheOptions.cacheEntities', cacheOptions.cacheEntities],
                ['cacheOptions.cacheQueryState', cacheOptions.cacheQueryState],
                ['options.query', options.query],
                ['queryKey', queryKey],
                ['resultSelector', cache.queries[queryKey].resultSelector],
            ]
                // eslint-disable-next-line react-hooks/rules-of-hooks
                .forEach((args) => (0, utilsAndConstants_1.useAssertValueNotChanged)(...args));
        })();
    const forceUpdate = (0, utilsAndConstants_1.useForceUpdate)();
    // Keeps most of local state.
    // Reference because state is changed not only by changing hook arguments, but also by calling fetch, and it should be done synchronously.
    const stateRef = (0, react_1.useRef)({});
    (0, react_1.useMemo)(() => {
        if (skip || stateRef.current.paramsKey === hookParamsKey) {
            return;
        }
        const resultSelectorImpl = cache.queries[queryKey].resultSelector;
        const state = stateRef.current;
        state.params = hookParams;
        state.paramsKey = hookParamsKey;
        state.latestHookParamsKey = state.paramsKey;
        // @ts-expect-error fix later
        state.cacheKey = getCacheKey(hookParams);
        state.resultSelector = createResultSelector(
        // @ts-expect-error fix later
        resultSelectorImpl, cache.cacheStateSelector, hookParams);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hookParamsKey, skip]);
    const resultFromSelector = 
    // eslint-disable-next-line react-hooks/rules-of-hooks
    stateRef.current.resultSelector && (0, react_redux_1.useSelector)(stateRef.current.resultSelector);
    const hasResultFromSelector = resultFromSelector !== undefined;
    const queryStateSelector = (0, react_1.useCallback)((state) => {
        cache.options.logsEnabled &&
            (0, utilsAndConstants_1.log)('queryStateSelector', {
                state,
                queryKey,
                cacheKey: stateRef.current.cacheKey,
                cacheState: cache.cacheStateSelector(state),
            });
        const queryState = cache.cacheStateSelector(state).queries[queryKey][stateRef.current.cacheKey];
        return queryState; // TODO proper type
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);
    const queryStateFromSelector = (_d = (0, react_redux_1.useSelector)(queryStateSelector)) !== null && _d !== void 0 ? _d : utilsAndConstants_1.defaultQueryMutationState;
    const queryState = hasResultFromSelector
        ? (Object.assign(Object.assign({}, queryStateFromSelector), { result: resultFromSelector }))
        : queryStateFromSelector;
    const fetchImpl = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        var _e;
        cache.options.logsEnabled && (0, utilsAndConstants_1.log)('useQuery.fetchImpl', { queryState });
        if (queryState.loading) {
            return;
        }
        cacheOptions.cacheQueryState &&
            store.dispatch((0, reducer_1.setQueryStateAndEntities)(queryKey, stateRef.current.cacheKey, {
                loading: true,
            }));
        const { paramsKey, params } = stateRef.current;
        let response;
        const fetchFn = cache.queries[queryKey].query;
        try {
            response = yield fetchFn(
            // @ts-expect-error fix later
            params);
        }
        catch (error) {
            if (stateRef.current.paramsKey === paramsKey && cacheOptions.cacheQueryState) {
                store.dispatch((0, reducer_1.setQueryStateAndEntities)(queryKey, stateRef.current.cacheKey, {
                    error: error,
                    loading: false,
                }));
            }
        }
        if (response && stateRef.current.paramsKey === paramsKey) {
            store.dispatch((0, reducer_1.setQueryStateAndEntities)(queryKey, stateRef.current.cacheKey, !cacheOptions.cacheQueryState
                ? undefined
                : {
                    error: undefined,
                    loading: false,
                    result: hasResultFromSelector
                        ? undefined
                        : mergeResults
                            ? mergeResults(
                            // @ts-expect-error fix later
                            (_e = queryStateSelector(store.getState())) === null || _e === void 0 ? void 0 : _e.result, response, params)
                            : response.result,
                }, cacheOptions.cacheEntities ? response : undefined));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [mergeResults, queryState.loading, hasResultFromSelector]);
    (0, react_1.useEffect)(() => {
        if (queryState.result != null && cacheOptions.policy === 'cache-first') {
            return;
        }
        fetchImpl();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [stateRef.current.latestHookParamsKey]);
    const fetch = (0, react_1.useCallback)((params) => {
        cache.options.logsEnabled && (0, utilsAndConstants_1.log)('useQuery.fetch', params);
        if (params !== undefined) {
            const state = stateRef.current;
            // @ts-expect-error fix later
            const paramsKey = getParamsKey(params);
            if (state.paramsKey !== paramsKey) {
                const resultSelectorImpl = cache.queries[queryKey].resultSelector;
                state.params = params;
                state.paramsKey = paramsKey;
                // @ts-expect-error fix later
                state.cacheKey = getCacheKey(params);
                state.resultSelector = createResultSelector(
                // @ts-expect-error fix later
                resultSelectorImpl, cache.cacheStateSelector, hookParams);
                forceUpdate();
            }
        }
        return fetchImpl();
    }, 
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fetchImpl, getCacheKey]);
    return [queryState, fetch];
};
exports.useQuery = useQuery;
const createResultSelector = (resultSelector, cacheStateSelector, params) => {
    return (resultSelector && ((state) => resultSelector(cacheStateSelector(state), params)));
};
