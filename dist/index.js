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
exports.defaultQueryMutationState = exports.defaultGetCacheKey = exports.createCache = void 0;
var createCache_1 = require("./createCache");
Object.defineProperty(exports, "createCache", { enumerable: true, get: function () { return createCache_1.createCache; } });
__exportStar(require("./types"), exports);
var utilsAndConstants_1 = require("./utilsAndConstants");
Object.defineProperty(exports, "defaultGetCacheKey", { enumerable: true, get: function () { return utilsAndConstants_1.defaultGetCacheKey; } });
Object.defineProperty(exports, "defaultQueryMutationState", { enumerable: true, get: function () { return utilsAndConstants_1.DEFAULT_QUERY_MUTATION_STATE; } });
// Backlog
// ! high
// screenshot of redux state to README
// optimistic response
// cover with tests
// try use skip for refreshing strategy?
// add example without normalization
// make query key / cache key difference more clear in the docs
// ! medium
// make named caches to produce named hooks, actions etc (same as slices in RTK)?
// allow multiple mutation with same keys?
// type extractors from cache
// custom useStore
// return back deserialize selector?
// resultSelector - return also boolean that result is full enough or make cache policy as a function
// selector for entities by typename
// callback option on error / success?
// refetch queries on mutation success
// remove query/mutation state when it finished without errors
// deep equal entities while merging state
// make error type generic
// don't cache result if resultSelector set? throw error if mergeResult set with resultSelector?
// ! low
// add params to the state?
// cancellation to queries
// if mutation & query alrady loading - make options: last, throttle, debounce, parallel?
// add time-to-live option, and/or time-to-refresh
// add refresh interval for queries that are mounted
// replace try/catch with returned error
// support any store, not only redux
// readonly types?
// proper types, remove as, any, todo
// add number of retries param?
