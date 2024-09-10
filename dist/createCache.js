"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCache = void 0;
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const createActions_1 = require("./createActions");
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
    var _a, _b, _c, _d, _e, _f;
    var _g, _h;
    const abortControllers = new WeakMap();
    // provide all optional fields
    (_a = partialCache.options) !== null && _a !== void 0 ? _a : (partialCache.options = {});
    (_b = (_g = partialCache.options).logsEnabled) !== null && _b !== void 0 ? _b : (_g.logsEnabled = false);
    (_c = (_h = partialCache.options).validateFunctionArguments) !== null && _c !== void 0 ? _c : (_h.validateFunctionArguments = utilsAndConstants_1.IS_DEV);
    (_d = partialCache.queries) !== null && _d !== void 0 ? _d : (partialCache.queries = {});
    (_e = partialCache.mutations) !== null && _e !== void 0 ? _e : (partialCache.mutations = {});
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (_f = partialCache.cacheStateSelector) !== null && _f !== void 0 ? _f : (partialCache.cacheStateSelector = (state) => state[cache.name]);
    // @ts-expect-error private field for testing
    partialCache.abortControllers = abortControllers;
    const cache = partialCache;
    // make selectors
    const selectQueryState = (state, query, cacheKey) => {
        // @ts-expect-error fix later
        return cache.cacheStateSelector(state).queries[query][cacheKey];
    };
    const selectMutationState = (state, mutation) => {
        // @ts-expect-error fix later
        return cache.cacheStateSelector(state).mutations[mutation];
    };
    const actions = (0, createActions_1.createActions)(cache.name);
    return {
        /** Keeps all options, passed while creating the cache. */
        cache,
        /** Reducer of the cache, should be added to redux store. */
        reducer: (0, reducer_1.createCacheReducer)(actions, cache.typenames, Object.keys(cache.queries), cache.options),
        actions,
        selectors: {
            /** Selects query state. */
            selectQueryState,
            /** Selects query latest result. */
            selectQueryResult: (state, query, cacheKey) => {
                var _a;
                return (_a = selectQueryState(state, query, cacheKey)) === null || _a === void 0 ? void 0 : _a.result;
            },
            /** Selects query loading state. */
            selectQueryLoading: (state, query, cacheKey) => {
                var _a;
                return (_a = selectQueryState(state, query, cacheKey)) === null || _a === void 0 ? void 0 : _a.loading;
            },
            /** Selects query latest error. */
            selectQueryError: (state, query, cacheKey) => {
                var _a;
                return (_a = selectQueryState(state, query, cacheKey)) === null || _a === void 0 ? void 0 : _a.error;
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
            /** Selects entity by id and typename. */
            selectEntityById: (state, id, typename) => {
                return id == null ? undefined : cache.cacheStateSelector(state).entities[typename][id];
            },
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
                            const { query: queryKey, params } = options;
                            const getCacheKey = (_a = cache.queries[queryKey].getCacheKey) !== null && _a !== void 0 ? _a : (utilsAndConstants_1.defaultGetCacheKey);
                            // @ts-expect-error fix later
                            const cacheKey = getCacheKey(params);
                            return (0, query_1.query)('query', store, cache, actions, queryKey, cacheKey, params);
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
