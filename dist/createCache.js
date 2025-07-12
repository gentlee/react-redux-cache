"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCache = exports.withTypenames = void 0;
const react_1 = require("react");
const createActions_1 = require("./createActions");
const createCacheReducer_1 = require("./createCacheReducer");
const createSelectors_1 = require("./createSelectors");
const mutate_1 = require("./mutate");
const query_1 = require("./query");
const useMutation_1 = require("./useMutation");
const useQuery_1 = require("./useQuery");
const utilsAndConstants_1 = require("./utilsAndConstants");
/**
 * Function to provide generic Typenames if normalization is needed - this is a Typescript limitation.
 * Returns object with createCache function with provided typenames.
 * @example
 * const cache = withTypenames<MyTypenames>().createCache({
 *   ...
 * })
 */
const withTypenames = () => {
    /**
     * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
     */
    return {
        createCache: (partialCache) => {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
            var _o, _p, _q, _r, _s, _t;
            const abortControllers = new WeakMap();
            // Provide all optional fields
            (_a = partialCache.options) !== null && _a !== void 0 ? _a : (partialCache.options = {});
            (_b = (_o = partialCache.options).logsEnabled) !== null && _b !== void 0 ? _b : (_o.logsEnabled = false);
            (_c = (_p = partialCache.options).additionalValidation) !== null && _c !== void 0 ? _c : (_p.additionalValidation = utilsAndConstants_1.IS_DEV);
            (_d = (_q = partialCache.options).deepComparisonEnabled) !== null && _d !== void 0 ? _d : (_q.deepComparisonEnabled = true);
            (_e = partialCache.globals) !== null && _e !== void 0 ? _e : (partialCache.globals = {});
            (_f = (_r = partialCache.globals).queries) !== null && _f !== void 0 ? _f : (_r.queries = {});
            (_g = (_s = partialCache.globals.queries).fetchPolicy) !== null && _g !== void 0 ? _g : (_s.fetchPolicy = utilsAndConstants_1.FetchPolicy.NoCacheOrExpired);
            (_h = (_t = partialCache.globals.queries).skipFetch) !== null && _h !== void 0 ? _h : (_t.skipFetch = false);
            (_j = partialCache.storeHooks) !== null && _j !== void 0 ? _j : (partialCache.storeHooks = {
                useStore: require('react-redux').useStore,
                useSelector: require('react-redux').useSelector,
            });
            (_k = partialCache.cacheStateSelector) !== null && _k !== void 0 ? _k : (partialCache.cacheStateSelector = (state) => state[cache.name]);
            (_l = partialCache.mutations) !== null && _l !== void 0 ? _l : (partialCache.mutations = {});
            (_m = partialCache.queries) !== null && _m !== void 0 ? _m : (partialCache.queries = {});
            // @ts-expect-error private field for testing
            partialCache.abortControllers = abortControllers;
            const cache = partialCache;
            // Validate options
            if (cache.options.deepComparisonEnabled && !utilsAndConstants_1.optionalUtils.deepEqual) {
                console.warn('react-redux-cache: optional dependency for fast-deep-equal was not provided, while deepComparisonEnabled option is true');
            }
            // State comparers
            /** Transforms array of keys to comparer function. */
            const setDefaultComparer = (target) => {
                if ((target === null || target === void 0 ? void 0 : target.selectorComparer) != null && typeof target.selectorComparer === 'object') {
                    target.selectorComparer = (0, utilsAndConstants_1.createStateComparer)(target.selectorComparer);
                }
            };
            setDefaultComparer(cache.globals.queries);
            for (const queryKey in partialCache.queries) {
                // @ts-expect-error TODO fix types
                setDefaultComparer(partialCache.queries[queryKey]);
            }
            // Selectors
            const selectors = Object.assign({ selectCacheState: cache.cacheStateSelector }, (0, createSelectors_1.createSelectors)(cache));
            const { selectCacheState, selectQueryState, selectQueryResult, selectQueryLoading, selectQueryError, selectQueryParams, selectQueryExpiresAt, selectMutationState, selectMutationResult, selectMutationLoading, selectMutationError, selectMutationParams, selectEntityById, selectEntities, selectEntitiesByTypename, } = selectors;
            // Actions
            const actions = (0, createActions_1.createActions)(cache.name);
            const { updateQueryStateAndEntities, updateMutationStateAndEntities, mergeEntityChanges, invalidateQuery, clearQueryState, clearMutationState, clearCache, } = actions;
            // Reducer
            const reducer = (0, createCacheReducer_1.createCacheReducer)(actions, Object.keys(cache.queries), cache.options);
            // Client creator
            const createClient = (store) => {
                const client = {
                    query: (options) => {
                        var _a;
                        const { query: queryKey, params } = options;
                        const getCacheKey = (_a = cache.queries[queryKey].getCacheKey) !== null && _a !== void 0 ? _a : (utilsAndConstants_1.defaultGetCacheKey);
                        // @ts-expect-error fix later
                        const cacheKey = getCacheKey(params);
                        return (0, query_1.query)('query', store, cache, actions, selectors, queryKey, cacheKey, params, options.secondsToLive, options.onlyIfExpired, 
                        // @ts-expect-error fix later
                        options.mergeResults, options.onCompleted, options.onSuccess, options.onError);
                    },
                    mutate: (options) => {
                        return (0, mutate_1.mutate)('mutate', store, cache, actions, selectors, options.mutation, options.params, abortControllers, 
                        // @ts-expect-error fix later
                        options.onCompleted, options.onSuccess, options.onError);
                    },
                };
                return client;
            };
            return {
                /** Keeps all options, passed while creating the cache. */
                cache,
                /** Reducer of the cache, should be added to redux store. */
                reducer,
                actions: {
                    /** Updates query state, and optionally merges entity changes in a single action. */
                    updateQueryStateAndEntities,
                    /** Updates mutation state, and optionally merges entity changes in a single action. */
                    updateMutationStateAndEntities,
                    /** Merges EntityChanges to the state. */
                    mergeEntityChanges,
                    /** Invalidates query states. */
                    invalidateQuery,
                    /** Clears states for provided query keys and cache keys.
                     * If cache key for query key is not provided, the whole state for query key is cleared. */
                    clearQueryState,
                    /** Clears states for provided mutation keys. */
                    clearMutationState,
                    /** Replaces cache state with initial, optionally merging with provided state. Doesn't cancel running fetches and shoult be used with caution. */
                    clearCache,
                },
                selectors: {
                    /** This is a cacheStateSelector from createCache options, or default one if was not provided. */
                    selectCacheState,
                    /** Selects query state. */
                    selectQueryState,
                    /** Selects query latest result. */
                    selectQueryResult,
                    /** Selects query loading state. */
                    selectQueryLoading,
                    /** Selects query latest error. */
                    selectQueryError,
                    /** Selects query latest params. */
                    selectQueryParams,
                    /** Selects query latest expiresAt. */
                    selectQueryExpiresAt,
                    /** Selects mutation state. */
                    selectMutationState,
                    /** Selects mutation latest result. */
                    selectMutationResult,
                    /** Selects mutation loading state. */
                    selectMutationLoading,
                    /** Selects mutation latest error. */
                    selectMutationError,
                    /** Selects mutation latest params. */
                    selectMutationParams,
                    /** Selects entity by id and typename. */
                    selectEntityById,
                    /** Selects all entities. */
                    selectEntities,
                    /** Selects all entities of provided typename. */
                    selectEntitiesByTypename,
                },
                hooks: {
                    /** Returns client object with query and mutate functions. */
                    useClient: () => {
                        const store = cache.storeHooks.useStore();
                        return (0, react_1.useMemo)(() => createClient(store), [store]);
                    },
                    /** Fetches query when params change and subscribes to query state changes (except `expiresAt` field). */
                    useQuery: (options) => (0, useQuery_1.useQuery)(cache, actions, selectors, options),
                    /** Subscribes to provided mutation state and provides mutate function. */
                    useMutation: (options) => (0, useMutation_1.useMutation)(cache, actions, selectors, options, abortControllers),
                    /** useSelector + selectEntityById. */
                    useSelectEntityById: (id, typename) => {
                        return cache.storeHooks.useSelector((state) => selectEntityById(state, id, typename));
                    },
                },
                utils: {
                    /** Creates client by providing the store. Can be used when the store is a singleton - to not use a hook for getting the client, but import it directly. */
                    createClient,
                    /** Generates the initial state by calling a reducer. Not needed for redux — it already generates it the same way when creating the store. */
                    getInitialState: () => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        return reducer(undefined, utilsAndConstants_1.EMPTY_OBJECT);
                    },
                    /** Apply changes to the entities map.
                     * @returns `undefined` if nothing to change, otherwise new `EntitiesMap<T>` with applied changes. */
                    applyEntityChanges: (entities, changes) => {
                        return (0, utilsAndConstants_1.applyEntityChanges)(entities, changes, cache.options);
                    },
                },
            };
        },
    };
};
exports.withTypenames = withTypenames;
/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
exports.createCache = (0, exports.withTypenames)().createCache;
