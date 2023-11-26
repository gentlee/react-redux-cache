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
exports.processEntityChanges = exports.defaultQueryMutationState = exports.defaultGetParamsKey = exports.defaultCacheOptions = exports.queryCacheOptionsByPolicy = exports.defaultQueryCacheOptions = exports.defaultMutationCacheOptions = exports.createCache = void 0;
var createCache_1 = require("./createCache");
Object.defineProperty(exports, "createCache", { enumerable: true, get: function () { return createCache_1.createCache; } });
__exportStar(require("./types"), exports);
var useMutation_1 = require("./useMutation");
Object.defineProperty(exports, "defaultMutationCacheOptions", { enumerable: true, get: function () { return useMutation_1.defaultMutationCacheOptions; } });
var useQuery_1 = require("./useQuery");
Object.defineProperty(exports, "defaultQueryCacheOptions", { enumerable: true, get: function () { return useQuery_1.defaultQueryCacheOptions; } });
Object.defineProperty(exports, "queryCacheOptionsByPolicy", { enumerable: true, get: function () { return useQuery_1.queryCacheOptionsByPolicy; } });
var utilsAndConstants_1 = require("./utilsAndConstants");
Object.defineProperty(exports, "defaultCacheOptions", { enumerable: true, get: function () { return utilsAndConstants_1.defaultCacheOptions; } });
Object.defineProperty(exports, "defaultGetParamsKey", { enumerable: true, get: function () { return utilsAndConstants_1.defaultGetParamsKey; } });
Object.defineProperty(exports, "defaultQueryMutationState", { enumerable: true, get: function () { return utilsAndConstants_1.defaultQueryMutationState; } });
Object.defineProperty(exports, "processEntityChanges", { enumerable: true, get: function () { return utilsAndConstants_1.processEntityChanges; } });
// Backlog
// ! high
// cover with tests
// support changing query key?
// make cache fields readonly
// ! medium
// type extractors from cache
// custom useStore
// return back deserialize selector?
// resultSelector - return also boolean that result is full enough
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
// remove defaultState and keep values undefined?
// add params to the state?
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
// don't cache result if resultSelector set? throw error if mergeResult set with resultSelector?
