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
exports.defaultGetCacheKey = exports.withTypenames = exports.createCache = void 0;
var createCache_1 = require("./createCache");
Object.defineProperty(exports, "createCache", { enumerable: true, get: function () { return createCache_1.createCache; } });
Object.defineProperty(exports, "withTypenames", { enumerable: true, get: function () { return createCache_1.withTypenames; } });
__exportStar(require("./types"), exports);
var utilsAndConstants_1 = require("./utilsAndConstants");
Object.defineProperty(exports, "defaultGetCacheKey", { enumerable: true, get: function () { return utilsAndConstants_1.defaultGetCacheKey; } });
// Backlog
// ! high (1.0.0)
// remove cachePolicy? make skip/enabled a function? skip -> enabled/shouldFetch?
// generate full api docs
// ! medium
// example rca -> vite
// optimistic response
// reset [whole] cache to initial / to provided state
// globals for success, completions and loading states?
// make query key / cache key difference more clear in the docs
// check type of function arguments in dev
// ! low
// local cache policy to keep in component state?
// make error type generic
// allow multiple mutation with same keys?
// custom useStore & useSelector to support multiple stores?
// easy access to all currently loading queries and mutations?
// cancellation to queries
// if mutation & query already loading - make options: last, throttle, debounce, parallel?
// add refresh interval for queries that are mounted?
// readonly types?
// proper types, remove as, any, todo
// add number of retries param?
