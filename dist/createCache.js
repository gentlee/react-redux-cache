"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCache = void 0;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const mutate_1 = require("./mutate");
const query_1 = require("./query");
const reducer_1 = require("./reducer");
const useMutation_1 = require("./useMutation");
const useQuery_1 = require("./useQuery");
const utilsAndConstants_1 = require("./utilsAndConstants");
/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
const createCache = (cache) => {
    var _a, _b, _c, _d, _e, _f;
    var _g, _h, _j;
    // @ts-expect-error hot
    const hotReloadEnabled = Boolean(module === null || module === void 0 ? void 0 : module.hot);
    const abortControllers = new WeakMap();
    // provide all optional fields
    // and transform cacheOptions from QueryCachePolicy to QueryCacheOptions
    (_a = cache.options) !== null && _a !== void 0 ? _a : (cache.options = {});
    (_b = (_g = cache.options).logsEnabled) !== null && _b !== void 0 ? _b : (_g.logsEnabled = false);
    (_c = (_h = cache.options).validateFunctionArguments) !== null && _c !== void 0 ? _c : (_h.validateFunctionArguments = utilsAndConstants_1.isDev);
    (_d = (_j = cache.options).validateHookArguments) !== null && _d !== void 0 ? _d : (_j.validateHookArguments = utilsAndConstants_1.isDev && !hotReloadEnabled);
    (_e = cache.queries) !== null && _e !== void 0 ? _e : (cache.queries = {});
    (_f = cache.mutations) !== null && _f !== void 0 ? _f : (cache.mutations = {});
    // @ts-expect-error for testing
    cache.abortControllers = abortControllers;
    for (const queryInfo of Object.values(cache.queries)) {
        if (typeof queryInfo.cacheOptions === 'string') {
            queryInfo.cacheOptions = useQuery_1.queryCacheOptionsByPolicy[queryInfo.cacheOptions];
        }
    }
    const nonPartialCache = cache;
    // make selectors
    const entitiesSelector = (state) => {
        return nonPartialCache.cacheStateSelector(state).entities;
    };
    const enitityMapSelectorByTypename = Object.keys(cache.typenames).reduce((result, x) => {
        result[x] = (state) => nonPartialCache.cacheStateSelector(state).entities[x];
        return result;
    }, {});
    return {
        cache: nonPartialCache,
        /** Reducer of the cache, should be added to redux store. */
        reducer: (0, reducer_1.createCacheReducer)(nonPartialCache.typenames, nonPartialCache.queries, nonPartialCache.mutations, nonPartialCache.options),
        actions: {
            /** Updates query state, and optionally merges entity changes in a single action. */
            setQueryStateAndEntities: reducer_1.setQueryStateAndEntities,
            /** Updates mutation state, and optionally merges entity changes in a single action. */
            setMutationStateAndEntities: reducer_1.setMutationStateAndEntities,
            /** Merge EntityChanges to the state. */
            mergeEntityChanges: reducer_1.mergeEntityChanges,
        },
        selectors: {
            entitiesSelector,
            entitiesByTypenameSelector: (typename) => {
                return enitityMapSelectorByTypename[typename];
            },
        },
        hooks: {
            /** Returns client object with query function */
            useClient: () => {
                const store = (0, react_redux_1.useStore)();
                return (0, react_1.useMemo)(() => {
                    const client = {
                        query: (options) => {
                            var _a, _b;
                            const { query: queryKey, params, 
                            // TODO can be memoized for all query keys while creating cache
                            cacheOptions: cacheOptionsOrPolicy = Object.assign(Object.assign({}, ((_a = nonPartialCache.queries[queryKey].cacheOptions) !== null && _a !== void 0 ? _a : useQuery_1.defaultQueryCacheOptions)), { policy: 'cache-and-fetch' }), getCacheKey = nonPartialCache.queries[queryKey].getCacheKey, } = options;
                            const cacheOptions = typeof cacheOptionsOrPolicy === 'string'
                                ? useQuery_1.queryCacheOptionsByPolicy[cacheOptionsOrPolicy]
                                : cacheOptionsOrPolicy;
                            const getParamsKey = (_b = nonPartialCache.queries[queryKey].getParamsKey) !== null && _b !== void 0 ? _b : (utilsAndConstants_1.defaultGetParamsKey);
                            const cacheKey = getCacheKey
                                ? // @ts-expect-error fix later
                                    getCacheKey(params)
                                : // @ts-expect-error fix later
                                    getParamsKey(params);
                            return (0, query_1.query)('query', true, store, nonPartialCache, queryKey, cacheKey, cacheOptions, params);
                        },
                        mutate: (options) => {
                            var _a;
                            return (0, mutate_1.mutate)('mutate', true, store, nonPartialCache, options.mutation, (_a = options.cacheOptions) !== null && _a !== void 0 ? _a : useMutation_1.defaultMutationCacheOptions, options.params, abortControllers);
                        },
                    };
                    return client;
                }, [store]);
            },
            /** Fetches query when params change and subscribes to query state. */
            useQuery: (options) => (0, useQuery_1.useQuery)(nonPartialCache, options),
            /** Subscribes to provided mutation state and provides mutate function. */
            useMutation: (options) => (0, useMutation_1.useMutation)(nonPartialCache, options, abortControllers),
            /** Selects entity by id and subscribes to the changes. */
            useSelectEntityById: (id, typename) => {
                return (0, react_redux_1.useSelector)((state) => id == null ? undefined : nonPartialCache.cacheStateSelector(state).entities[typename][id]);
            },
        },
        utils: {
            applyEntityChanges: (entities, changes) => {
                return (0, utilsAndConstants_1.applyEntityChanges)(entities, changes, nonPartialCache.options);
            },
        },
    };
};
exports.createCache = createCache;
