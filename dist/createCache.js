"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCache = void 0;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const createActions_1 = require("./createActions");
const createCacheReducer_1 = require("./createCacheReducer");
const mutate_1 = require("./mutate");
const query_1 = require("./query");
const useMutation_1 = require("./useMutation");
const useQuery_1 = require("./useQuery");
const utilsAndConstants_1 = require("./utilsAndConstants");
/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
const createCache = (partialCache) => {
    var _a, _b, _c, _d, _e, _f, _g;
    var _h, _j, _k;
    const abortControllers = new WeakMap();
    // provide all optional fields
    (_a = partialCache.options) !== null && _a !== void 0 ? _a : (partialCache.options = {});
    (_b = (_h = partialCache.options).logsEnabled) !== null && _b !== void 0 ? _b : (_h.logsEnabled = false);
    (_c = (_j = partialCache.options).validateFunctionArguments) !== null && _c !== void 0 ? _c : (_j.validateFunctionArguments = utilsAndConstants_1.IS_DEV);
    (_d = (_k = partialCache.options).deepComparisonEnabled) !== null && _d !== void 0 ? _d : (_k.deepComparisonEnabled = true);
    (_e = partialCache.queries) !== null && _e !== void 0 ? _e : (partialCache.queries = {});
    (_f = partialCache.mutations) !== null && _f !== void 0 ? _f : (partialCache.mutations = {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_g = partialCache.cacheStateSelector) !== null && _g !== void 0 ? _g : (partialCache.cacheStateSelector = (state) => state[cache.name]);
    // @ts-expect-error private field for testing
    partialCache.abortControllers = abortControllers;
    const cache = partialCache;
    // make selectors
    const selectEntityById = (state, id, typename) => {
        return id == null ? undefined : cache.cacheStateSelector(state).entities[typename][id];
    };
    const selectQueryState = (state, query, cacheKey) => {
        var _a;
        // @ts-expect-error fix later
        return (_a = cache.cacheStateSelector(state).queries[query][cacheKey]) !== null && _a !== void 0 ? _a : utilsAndConstants_1.DEFAULT_QUERY_MUTATION_STATE;
    };
    const selectMutationState = (state, mutation) => {
        var _a;
        // @ts-expect-error fix later
        return (_a = cache.cacheStateSelector(state).mutations[mutation]) !== null && _a !== void 0 ? _a : utilsAndConstants_1.DEFAULT_QUERY_MUTATION_STATE;
    };
    const actions = (0, createActions_1.createActions)(cache.name);
    return {
        /** Keeps all options, passed while creating the cache. */
        cache,
        /** Reducer of the cache, should be added to redux store. */
        reducer: (0, createCacheReducer_1.createCacheReducer)(actions, cache.typenames, Object.keys(cache.queries), cache.options),
        actions,
        selectors: {
            /** Selects query state. */
            selectQueryState,
            /** Selects query latest result. */
            selectQueryResult: (state, query, cacheKey) => {
                return selectQueryState(state, query, cacheKey).result;
            },
            /** Selects query loading state. */
            selectQueryLoading: (state, query, cacheKey) => {
                return selectQueryState(state, query, cacheKey).loading;
            },
            /** Selects query latest error. */
            selectQueryError: (state, query, cacheKey) => {
                return selectQueryState(state, query, cacheKey).error;
            },
            /** Selects query latest params. */
            selectQueryParams: (state, query, cacheKey) => {
                return selectQueryState(state, query, cacheKey).params;
            },
            /** Selects query expiresAt value. */
            selectQueryExpiresAt: (state, query, cacheKey) => {
                return selectQueryState(state, query, cacheKey).expiresAt;
            },
            /** Selects mutation state. */
            selectMutationState,
            /** Selects mutation latest result. */
            selectMutationResult: (state, mutation) => {
                return selectMutationState(state, mutation).result;
            },
            /** Selects mutation loading state. */
            selectMutationLoading: (state, mutation) => {
                return selectMutationState(state, mutation).loading;
            },
            /** Selects mutation latest error. */
            selectMutationError: (state, mutation) => {
                return selectMutationState(state, mutation).error;
            },
            /** Selects mutation latest params. */
            selectMutationParams: (state, mutation) => {
                return selectMutationState(state, mutation).params;
            },
            /** Selects entity by id and typename. */
            selectEntityById,
            /** Selects all entities. */
            selectEntities: (state) => {
                return cache.cacheStateSelector(state).entities;
            },
            /** Selects all entities of provided typename. */
            selectEntitiesByTypename: (state, typename) => {
                return cache.cacheStateSelector(state).entities[typename];
            },
        },
        hooks: {
            /** Returns client object with query and mutate functions. */
            useClient: () => {
                const store = (0, react_redux_1.useStore)();
                return (0, react_1.useMemo)(() => {
                    const client = {
                        query: (options) => {
                            var _a;
                            const { query: queryKey, params, onlyIfExpired } = options;
                            const getCacheKey = (_a = cache.queries[queryKey].getCacheKey) !== null && _a !== void 0 ? _a : (utilsAndConstants_1.defaultGetCacheKey);
                            // @ts-expect-error fix later
                            const cacheKey = getCacheKey(params);
                            return (0, query_1.query)('query', store, cache, actions, queryKey, cacheKey, params, onlyIfExpired);
                        },
                        mutate: (options) => {
                            return (0, mutate_1.mutate)('mutate', store, cache, actions, options.mutation, options.params, abortControllers);
                        },
                    };
                    return client;
                }, [store]);
            },
            /** Fetches query when params change and subscribes to query state. */
            useQuery: (options) => (0, useQuery_1.useQuery)(cache, actions, options),
            /** Subscribes to provided mutation state and provides mutate function. */
            useMutation: (options) => (0, useMutation_1.useMutation)(cache, actions, options, abortControllers),
            /** useSelector + selectEntityById. */
            useSelectEntityById: (id, typename) => {
                return (0, react_redux_1.useSelector)((state) => selectEntityById(state, id, typename));
            },
        },
        utils: {
            /**
             * Apply changes to the entities map.
             * @return `undefined` if nothing to change, otherwise new entities map with applied changes.
             */
            applyEntityChanges: (entities, changes) => {
                return (0, utilsAndConstants_1.applyEntityChanges)(entities, changes, cache.options);
            },
        },
    };
};
exports.createCache = createCache;
