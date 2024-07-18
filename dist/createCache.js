"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCache = void 0;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const actions_1 = require("./actions");
const mutate_1 = require("./mutate");
const query_1 = require("./query");
const reducer_1 = require("./reducer");
const useMutation_1 = require("./useMutation");
const useQuery_1 = require("./useQuery");
const utilsAndConstants_1 = require("./utilsAndConstants");
/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
const createCache = (partialCache) => {
    var _a, _b, _c, _d, _e;
    var _f, _g;
    const abortControllers = new WeakMap();
    // provide all optional fields
    (_a = partialCache.options) !== null && _a !== void 0 ? _a : (partialCache.options = {});
    (_b = (_f = partialCache.options).logsEnabled) !== null && _b !== void 0 ? _b : (_f.logsEnabled = false);
    (_c = (_g = partialCache.options).validateFunctionArguments) !== null && _c !== void 0 ? _c : (_g.validateFunctionArguments = utilsAndConstants_1.IS_DEV);
    (_d = partialCache.queries) !== null && _d !== void 0 ? _d : (partialCache.queries = {});
    (_e = partialCache.mutations) !== null && _e !== void 0 ? _e : (partialCache.mutations = {});
    // @ts-expect-error for testing
    partialCache.abortControllers = abortControllers;
    const cache = partialCache;
    // make selectors
    const entitiesSelector = (state) => {
        return cache.cacheStateSelector(state).entities;
    };
    const enitityMapSelectorByTypename = Object.keys(partialCache.typenames).reduce((result, x) => {
        result[x] = (state) => cache.cacheStateSelector(state).entities[x];
        return result;
    }, {});
    return {
        cache,
        /** Reducer of the cache, should be added to redux store. */
        reducer: (0, reducer_1.createCacheReducer)(cache.typenames, cache.queries, cache.mutations, cache.options),
        actions: {
            /** Updates query state, and optionally merges entity changes in a single action. */
            updateQueryStateAndEntities: actions_1.updateQueryStateAndEntities,
            /** Updates mutation state, and optionally merges entity changes in a single action. */
            updateMutationStateAndEntities: actions_1.updateMutationStateAndEntities,
            /** Merge EntityChanges to the state. */
            mergeEntityChanges: actions_1.mergeEntityChanges,
            /** Clear states for provided query keys and cache keys.
             * If cache key for query key is not provided, the whole state for query key is cleared. */
            clearQueryState: actions_1.clearQueryState,
            /** Clear states for provided mutation keys. */
            clearMutationState: actions_1.clearMutationState,
        },
        selectors: {
            /** Select all entities from the state. */
            entitiesSelector,
            /** Select all entities of provided typename. */
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
                            const getCacheKey = (_a = cache.queries[queryKey].getCacheKey) !== null && _a !== void 0 ? _a : (utilsAndConstants_1.defaultGetCacheKey);
                            // @ts-expect-error fix later
                            const cacheKey = getCacheKey(params);
                            return (0, query_1.query)('query', true, store, cache, queryKey, cacheKey, params);
                        },
                        mutate: (options) => {
                            return (0, mutate_1.mutate)('mutate', true, store, cache, options.mutation, options.params, abortControllers);
                        },
                    };
                    return client;
                }, [store]);
            },
            /** Fetches query when params change and subscribes to query state. */
            useQuery: (options) => (0, useQuery_1.useQuery)(cache, options),
            /** Subscribes to provided mutation state and provides mutate function. */
            useMutation: (options) => (0, useMutation_1.useMutation)(cache, options, abortControllers),
            /** Selects entity by id and subscribes to the changes. */
            useSelectEntityById: (id, typename) => {
                return (0, react_redux_1.useSelector)((state) => id == null ? undefined : cache.cacheStateSelector(state).entities[typename][id]);
            },
        },
        utils: {
            applyEntityChanges: (entities, changes) => {
                return (0, utilsAndConstants_1.applyEntityChanges)(entities, changes, cache.options);
            },
        },
    };
};
exports.createCache = createCache;
