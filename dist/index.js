"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCache = void 0;
const react_redux_1 = require("react-redux");
const reducer_1 = require("./reducer");
const useMutation_1 = require("./useMutation");
const useQuery_1 = require("./useQuery");
const utilsAndConstants_1 = require("./utilsAndConstants");
// Backlog
// ! high
// create package with README
// cover with tests
// ! medium
// add params to the state
// selector for entities by typename
// provide call query/mutation function to call them without hooks, but with all state updates
// get typenames from schema? (useSelectDenormalized)
// callback option on error / success?
// cache policy as function? needsRefetch
// add verbose debug logs
// refetch queries on query / mutation success?
// remove state when it finished without errors
// set default options like getParams
// selectors for loading state of similar query or mutation (wihout using params as key)
// deep equal entities while merging state
// support multiple stores
// add validation if entity is full enough
// optimistic response
// make error type generic
// proper types, remove as, any, todo
// ! low
// cancellation to queries
// if mutation & query alrady loading - make options: last, throttle, debounce, parallel?
// add time-to-live option, and/or time-to-refresh
// add getUpdateTime option to check entities while merging
// useLocalMutation - uses local component state, or make store option - redux or component state or context? 1 version: redux only
// replace try/catch with returned error
// support any store, not only redux
// QueryInfo.defaultOptions
// set options in refresh/mutate functions
// multiple reducers instead of 1?
// don't cache result if resultSelector set?
__exportStar(require("./reducer"), exports);
__exportStar(require("./types"), exports);
__exportStar(require("./useMutation"), exports);
__exportStar(require("./useQuery"), exports);
__exportStar(require("./utilsAndConstants"), exports);
/** Creates reducer, actions and hooks for managing queries and mutations through redux cache. */
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
