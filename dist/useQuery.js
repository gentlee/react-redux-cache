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
const query_1 = require("./query");
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
    var _a, _b, _c;
    const { query: queryKey, skip, params, cacheOptions: cacheOptionsOrPolicy = (_a = cache.queries[queryKey].cacheOptions) !== null && _a !== void 0 ? _a : exports.defaultQueryCacheOptions, getCacheKey = cache.queries[queryKey].getCacheKey, } = options;
    const logsEnabled = cache.options.logsEnabled;
    const getParamsKey = (_b = cache.queries[queryKey].getParamsKey) !== null && _b !== void 0 ? _b : (utilsAndConstants_1.defaultGetParamsKey);
    const cacheResultSelector = cache.queries[queryKey].resultSelector;
    const cacheStateSelector = cache.cacheStateSelector;
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
                ['mergeResults', cache.queries[queryKey].mergeResults],
                ['getParamsKey', cache.queries[queryKey].getParamsKey],
                ['getCacheKey', cache.queries[queryKey].getCacheKey],
            ]
                // eslint-disable-next-line react-hooks/rules-of-hooks
                .forEach((args) => (0, utilsAndConstants_1.useAssertValueNotChanged)(...args));
        })();
    const paramsKey = getParamsKey(
    // @ts-expect-error fix later
    params);
    const [cacheKey, resultSelector] = (0, react_1.useMemo)(() => {
        return [
            // cacheKey
            getCacheKey
                ? // @ts-expect-error fix types later
                    getCacheKey(params)
                : paramsKey,
            // resultSelector
            cacheResultSelector &&
                ((state) => cacheResultSelector(cacheStateSelector(state), 
                // @ts-expect-error fix types later
                params)),
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsKey]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const resultFromSelector = (resultSelector && (0, react_redux_1.useSelector)(resultSelector));
    const hasResultFromSelector = resultFromSelector !== undefined;
    const fetch = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, query_1.query)('useQuery.fetch', false, store, cache, queryKey, cacheKey, cacheOptions, params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [
        cacheKey,
        paramsKey,
        cacheOptions.policy,
        cacheOptions.cacheEntities,
        cacheOptions.cacheQueryState,
    ]);
    const queryStateFromSelector = (_c = (0, react_redux_1.useSelector)((state) => {
        const queryState = cacheStateSelector(state).queries[queryKey][cacheKey];
        return queryState; // TODO proper type
    })) !== null && _c !== void 0 ? _c : utilsAndConstants_1.defaultQueryMutationState;
    const queryState = hasResultFromSelector
        ? (Object.assign(Object.assign({}, queryStateFromSelector), { result: resultFromSelector }))
        : queryStateFromSelector;
    (0, react_1.useEffect)(() => {
        if (skip) {
            logsEnabled && (0, utilsAndConstants_1.log)('useQuery.useEffect skip fetch', { skip, paramsKey });
            return;
        }
        if (queryState.result != null && cacheOptions.policy === 'cache-first') {
            logsEnabled &&
                (0, utilsAndConstants_1.log)('useQuery.useEffect don`t fetch due to cache policy', {
                    result: queryState.result,
                    policy: cacheOptions.policy,
                });
            return;
        }
        fetch();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [paramsKey, cacheOptions.policy, skip]);
    logsEnabled &&
        (0, utilsAndConstants_1.log)('useQuery', {
            paramsKey,
            cacheKey,
            options,
            resultFromSelector,
            queryState,
        });
    return [
        /** Query state */
        queryState,
        /** Refetch query with the same parameters */
        fetch,
    ];
};
exports.useQuery = useQuery;
