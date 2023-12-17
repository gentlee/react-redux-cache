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
    var _a, _b, _c, _d, _e;
    var _f, _g;
    const abortControllers = new WeakMap();
    // provide all optional fields
    (_a = cache.options) !== null && _a !== void 0 ? _a : (cache.options = {});
    (_b = (_f = cache.options).logsEnabled) !== null && _b !== void 0 ? _b : (_f.logsEnabled = false);
    (_c = (_g = cache.options).validateFunctionArguments) !== null && _c !== void 0 ? _c : (_g.validateFunctionArguments = utilsAndConstants_1.isDev);
    (_d = cache.queries) !== null && _d !== void 0 ? _d : (cache.queries = {});
    (_e = cache.mutations) !== null && _e !== void 0 ? _e : (cache.mutations = {});
    // @ts-expect-error for testing
    cache.abortControllers = abortControllers;
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
                            var _a;
                            const { query: queryKey, params } = options;
                            const getCacheKey = (_a = nonPartialCache.queries[queryKey].getCacheKey) !== null && _a !== void 0 ? _a : (utilsAndConstants_1.defaultGetCacheKey);
                            // @ts-expect-error fix later
                            const cacheKey = getCacheKey(params);
                            return (0, query_1.query)('query', true, store, nonPartialCache, queryKey, cacheKey, params);
                        },
                        mutate: (options) => {
                            return (0, mutate_1.mutate)('mutate', true, store, nonPartialCache, options.mutation, options.params, abortControllers);
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
