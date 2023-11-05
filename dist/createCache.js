"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCache = void 0;
const react_redux_1 = require("react-redux");
const reducer_1 = require("./reducer");
const useMutation_1 = require("./useMutation");
const useQuery_1 = require("./useQuery");
const utilsAndConstants_1 = require("./utilsAndConstants");
/**
 * Creates reducer, actions and hooks for managing queries and mutations through redux cache.
 */
const createCache = (cache) => {
    var _a, _b, _c, _d;
    var _e, _f, _g;
    // @ts-expect-error hot
    const hotReloadEnabled = Boolean(module === null || module === void 0 ? void 0 : module.hot);
    // provide all optional fields
    (_a = cache.options) !== null && _a !== void 0 ? _a : (cache.options = {});
    (_b = (_e = cache.options).logsEnabled) !== null && _b !== void 0 ? _b : (_e.logsEnabled = false);
    (_c = (_f = cache.options).validateFunctionArguments) !== null && _c !== void 0 ? _c : (_f.validateFunctionArguments = utilsAndConstants_1.isDev);
    (_d = (_g = cache.options).validateHookArguments) !== null && _d !== void 0 ? _d : (_g.validateHookArguments = utilsAndConstants_1.isDev && !hotReloadEnabled);
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
            /** Fetches query when params change and subscribes to query state. */
            useQuery: (options) => (0, useQuery_1.useQuery)(nonPartialCache, options),
            /** Subscribes to provided mutation state and provides mutate function. */
            useMutation: (options) => (0, useMutation_1.useMutation)(nonPartialCache, options),
            /** Selects entity by id and subscribes to the changes. */
            useSelectEntityById: (id, typename) => {
                return (0, react_redux_1.useSelector)((state) => id == null ? undefined : nonPartialCache.cacheStateSelector(state).entities[typename][id]);
            },
        },
    };
};
exports.createCache = createCache;
