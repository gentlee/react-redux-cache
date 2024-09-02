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
    const { query: queryKey, skip, params, cachePolicy = (_a = cache.queries[queryKey].cachePolicy) !== null && _a !== void 0 ? _a : 'cache-first', getCacheKey = (_b = cache.queries[queryKey].getCacheKey) !== null && _b !== void 0 ? _b : (utilsAndConstants_1.defaultGetCacheKey), } = options;
    const logsEnabled = cache.options.logsEnabled;
    const cacheResultSelector = cache.queries[queryKey].resultSelector;
    const cacheStateSelector = cache.cacheStateSelector;
    const store = (0, react_redux_1.useStore)();
    // @ts-expect-error fix types later
    const cacheKey = getCacheKey(params);
    const resultSelector = (0, react_1.useMemo)(() => {
        return (cacheResultSelector &&
            ((state) => cacheResultSelector(cacheStateSelector(state), 
            // @ts-expect-error fix types later
            params)));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cacheKey]);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const resultFromSelector = (resultSelector && (0, react_redux_1.useSelector)(resultSelector));
    const hasResultFromSelector = resultFromSelector !== undefined;
    const fetch = (0, react_1.useCallback)(() => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, query_1.query)('useQuery.fetch', false, store, cache, actions, queryKey, cacheKey, params);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }), [store, queryKey, cacheKey]);
    const queryStateFromSelector = (_c = (0, react_redux_1.useSelector)((state) => {
        const queryState = cacheStateSelector(state).queries[queryKey][cacheKey];
        return queryState; // TODO proper type
    })) !== null && _c !== void 0 ? _c : utilsAndConstants_1.DEFAULT_QUERY_MUTATION_STATE;
    const queryState = hasResultFromSelector
        ? (Object.assign(Object.assign({}, queryStateFromSelector), { result: resultFromSelector }))
        : queryStateFromSelector;
    (0, react_1.useEffect)(() => {
        if (skip) {
            logsEnabled && (0, utilsAndConstants_1.log)('useQuery.useEffect skip fetch', { skip, cacheKey });
            return;
        }
        if (queryState.result != null && cachePolicy === 'cache-first') {
            logsEnabled &&
                (0, utilsAndConstants_1.log)('useQuery.useEffect don`t fetch due to cache policy', {
                    result: queryState.result,
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
