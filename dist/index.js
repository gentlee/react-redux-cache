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
exports.defaultQueryMutationState = exports.defaultGetCacheKey = exports.withTypenames = exports.createCache = void 0;
var createCache_1 = require("./createCache");
Object.defineProperty(exports, "createCache", { enumerable: true, get: function () { return createCache_1.createCache; } });
Object.defineProperty(exports, "withTypenames", { enumerable: true, get: function () { return createCache_1.withTypenames; } });
__exportStar(require("./types"), exports);
var utilsAndConstants_1 = require("./utilsAndConstants");
Object.defineProperty(exports, "defaultGetCacheKey", { enumerable: true, get: function () { return utilsAndConstants_1.defaultGetCacheKey; } });
Object.defineProperty(exports, "defaultQueryMutationState", { enumerable: true, get: function () { return utilsAndConstants_1.DEFAULT_QUERY_MUTATION_STATE; } });
// Backlog
// ! high (1.0.0)
// rca -> vite
// defaults
// remove cachePolicy? make skip/enabled a function? skip -> enabled/shouldFetch?
// remove undefined optional fields & emtpy states
// generate full api docs
// ! medium
// optimistic response
// make query key / cache key difference more clear in the docs
// check type of function arguments in dev
// allow multiple mutation with same keys?
// return back deserialize selector?
// selector for entities by typename
// callback option on error / success?
// refetch queries on mutation success
// remove query/mutation state when it finished without errors
// deep equal entities while merging state
// make error type generic
// ! low
// custom useStore & useSelector to support multiple stores?
// access to currently loading queries and mutations?
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
