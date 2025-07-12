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
exports.isEmptyObject = exports.FetchPolicy = exports.defaultGetCacheKey = exports.createStateComparer = exports.withTypenames = exports.createCache = void 0;
var createCache_1 = require("./createCache");
Object.defineProperty(exports, "createCache", { enumerable: true, get: function () { return createCache_1.createCache; } });
Object.defineProperty(exports, "withTypenames", { enumerable: true, get: function () { return createCache_1.withTypenames; } });
__exportStar(require("./types"), exports);
var utilsAndConstants_1 = require("./utilsAndConstants");
Object.defineProperty(exports, "createStateComparer", { enumerable: true, get: function () { return utilsAndConstants_1.createStateComparer; } });
Object.defineProperty(exports, "defaultGetCacheKey", { enumerable: true, get: function () { return utilsAndConstants_1.defaultGetCacheKey; } });
Object.defineProperty(exports, "FetchPolicy", { enumerable: true, get: function () { return utilsAndConstants_1.FetchPolicy; } });
Object.defineProperty(exports, "isEmptyObject", { enumerable: true, get: function () { return utilsAndConstants_1.isEmptyObject; } });
// Backlog
// ! high (1.0.0-rc.0)
// generate full api docs
// optimistic response
// features list (table)
// ! medium
// onCancel & onAbort
// remove empty entities and queries from state
// globals for success, completions and loading states?
// make query key / cache key difference more clear in the docs
// check type of function arguments in dev
// make skipFetch a function?
// example -> playground with changable options
// ! low
// make error type generic
// allow multiple mutation with same keys?
// easy access to all currently loading queries and mutations?
// cancellation to queries
// if mutation & query already loading - make options: last, throttle, debounce, parallel?
// add refresh interval for queries that are mounted?
// readonly types?
// proper types, remove as, any, todo
// add number of retries param?
// mutation state wrong type - can be undefined?
// ! on hold
// better support queries without params: useQuery & selectors optional cache key (making useQuery params optional doesn't seem like a good idea)
// cancel all queries / mutations (already possible by recreating the store - this lib is pure)
