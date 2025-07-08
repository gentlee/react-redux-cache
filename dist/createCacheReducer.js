"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCacheReducer = void 0;
const utilsAndConstants_1 = require("./utilsAndConstants");
const optionalQueryKeys = [
    'error',
    'expiresAt',
    'result',
    'params',
    'loading',
];
const optionalMutationKeys = [
    'error',
    'result',
    'params',
    'loading',
];
const createCacheReducer = (actions, queryKeys, cacheOptions) => {
    const initialState = Object.freeze({
        entities: Object.freeze({}),
        queries: Object.freeze(queryKeys.reduce((result, x) => {
            result[x] = Object.freeze({});
            return result;
        }, {})),
        mutations: Object.freeze({}),
    });
    cacheOptions.logsEnabled &&
        (0, utilsAndConstants_1.log)('createCacheReducer', {
            queryKeys,
            initialState,
        });
    const deepEqual = cacheOptions.deepComparisonEnabled ? utilsAndConstants_1.optionalUtils.deepEqual : undefined;
    return (state = initialState, action) => {
        switch (action.type) {
            case actions.updateQueryStateAndEntities.type: {
                const { queryKey, queryCacheKey, state: queryState, entityChanges, } = action;
                const oldQueryState = state.queries[queryKey][queryCacheKey];
                let newQueryState = queryState && Object.assign(Object.assign({}, oldQueryState), queryState);
                if (newQueryState) {
                    if (oldQueryState && deepEqual) {
                        // set back params if deeply same value
                        if (newQueryState.params !== oldQueryState.params &&
                            deepEqual(newQueryState.params, oldQueryState.params)) {
                            newQueryState.params = oldQueryState.params;
                        }
                        // set back if deeply same value
                        if (newQueryState.result !== oldQueryState.result &&
                            deepEqual(newQueryState.result, oldQueryState.result)) {
                            newQueryState.result = oldQueryState.result;
                        }
                    }
                    // remove undefined optional fields
                    for (const key of optionalQueryKeys) {
                        if (key in newQueryState && newQueryState[key] === undefined) {
                            delete newQueryState[key];
                        }
                    }
                    // skip if new state deep equals to the old state
                    if (deepEqual === null || deepEqual === void 0 ? void 0 : deepEqual(oldQueryState !== null && oldQueryState !== void 0 ? oldQueryState : utilsAndConstants_1.EMPTY_OBJECT, newQueryState)) {
                        newQueryState = undefined;
                    }
                }
                const newEntities = entityChanges && (0, utilsAndConstants_1.applyEntityChanges)(state.entities, entityChanges, cacheOptions);
                let newState;
                if (newEntities) {
                    newState !== null && newState !== void 0 ? newState : (newState = Object.assign({}, state));
                    newState.entities = newEntities;
                }
                if (newQueryState) {
                    if (!(0, utilsAndConstants_1.isEmptyObject)(newQueryState)) {
                        newState !== null && newState !== void 0 ? newState : (newState = Object.assign({}, state));
                        newState.queries = Object.assign(Object.assign({}, state.queries), { [queryKey]: Object.assign(Object.assign({}, state.queries[queryKey]), { [queryCacheKey]: newQueryState }) });
                    }
                    else if (oldQueryState !== undefined) {
                        // empty states are removed
                        const _a = state.queries[queryKey], _b = queryCacheKey, _ = _a[_b], withoutCacheKey = __rest(_a, [typeof _b === "symbol" ? _b : _b + ""]);
                        newState !== null && newState !== void 0 ? newState : (newState = Object.assign({}, state));
                        newState.queries = Object.assign(Object.assign({}, state.queries), { [queryKey]: withoutCacheKey });
                    }
                }
                return newState !== null && newState !== void 0 ? newState : state;
            }
            case actions.updateMutationStateAndEntities.type: {
                const { mutationKey, state: mutationState, entityChanges, } = action;
                const oldMutationState = state.mutations[mutationKey];
                let newMutationState = mutationState && Object.assign(Object.assign({}, oldMutationState), mutationState);
                if (newMutationState) {
                    if (oldMutationState && deepEqual) {
                        // set back params if deeply same value
                        if (newMutationState.params !== oldMutationState.params &&
                            deepEqual(newMutationState.params, oldMutationState.params)) {
                            newMutationState.params = oldMutationState.params;
                        }
                        // set back if deeply same value
                        if (newMutationState.result !== oldMutationState.result &&
                            deepEqual(newMutationState.result, oldMutationState.result)) {
                            newMutationState.result = oldMutationState.result;
                        }
                    }
                    // remove optional fields with default values
                    for (const key of optionalMutationKeys) {
                        if (key in newMutationState && newMutationState[key] === undefined) {
                            delete newMutationState[key];
                        }
                    }
                    // skip if new state deep equals to the old state
                    if (deepEqual === null || deepEqual === void 0 ? void 0 : deepEqual(oldMutationState !== null && oldMutationState !== void 0 ? oldMutationState : utilsAndConstants_1.EMPTY_OBJECT, newMutationState)) {
                        newMutationState = undefined;
                    }
                }
                const newEntities = entityChanges && (0, utilsAndConstants_1.applyEntityChanges)(state.entities, entityChanges, cacheOptions);
                let newState;
                if (newEntities) {
                    newState !== null && newState !== void 0 ? newState : (newState = Object.assign({}, state));
                    newState.entities = newEntities;
                }
                if (newMutationState) {
                    if (!(0, utilsAndConstants_1.isEmptyObject)(newMutationState)) {
                        newState !== null && newState !== void 0 ? newState : (newState = Object.assign({}, state));
                        newState.mutations = Object.assign(Object.assign({}, state.mutations), { [mutationKey]: newMutationState });
                    }
                    else if (oldMutationState !== undefined) {
                        // empty states are removed
                        const _c = state.mutations, _d = mutationKey, _ = _c[_d], withoutMutationKey = __rest(_c, [typeof _d === "symbol" ? _d : _d + ""]);
                        newState !== null && newState !== void 0 ? newState : (newState = Object.assign({}, state));
                        newState.mutations = withoutMutationKey;
                    }
                }
                return newState !== null && newState !== void 0 ? newState : state;
            }
            case actions.mergeEntityChanges.type: {
                const { changes } = action;
                const newEntities = (0, utilsAndConstants_1.applyEntityChanges)(state.entities, changes, cacheOptions);
                return newEntities ? Object.assign(Object.assign({}, state), { entities: newEntities }) : state;
            }
            case actions.invalidateQuery.type: {
                const { queries: queriesToInvalidate } = action;
                if (queriesToInvalidate.length === 0) {
                    return state;
                }
                const now = Date.now();
                let newQueries = undefined;
                for (const { query: queryKey, cacheKey, expiresAt = now } of queriesToInvalidate) {
                    const queryStates = (newQueries !== null && newQueries !== void 0 ? newQueries : state.queries)[queryKey];
                    if (cacheKey != null) {
                        if (queryStates[cacheKey]) {
                            const queryState = queryStates[cacheKey];
                            if (queryState && queryState.expiresAt !== expiresAt) {
                                newQueries !== null && newQueries !== void 0 ? newQueries : (newQueries = Object.assign({}, state.queries));
                                if (state.queries[queryKey] === newQueries[queryKey]) {
                                    newQueries[queryKey] = Object.assign({}, newQueries[queryKey]);
                                }
                                // @ts-expect-error fix type later
                                newQueries[queryKey][cacheKey] = Object.assign(Object.assign({}, queryState), { expiresAt });
                                if (expiresAt === undefined) {
                                    delete newQueries[queryKey][cacheKey].expiresAt;
                                }
                            }
                        }
                    }
                    else {
                        for (const cacheKey in queryStates) {
                            const queryState = queryStates[cacheKey];
                            if (queryState && queryState.expiresAt !== expiresAt) {
                                newQueries !== null && newQueries !== void 0 ? newQueries : (newQueries = Object.assign({}, state.queries));
                                if (state.queries[queryKey] === newQueries[queryKey]) {
                                    newQueries[queryKey] = Object.assign({}, newQueries[queryKey]);
                                }
                                newQueries[queryKey][cacheKey] = Object.assign(Object.assign({}, queryState), { expiresAt });
                                if (expiresAt === undefined) {
                                    delete newQueries[queryKey][cacheKey].expiresAt;
                                }
                            }
                        }
                    }
                }
                return newQueries === undefined
                    ? state
                    : Object.assign(Object.assign({}, state), { queries: newQueries });
            }
            case actions.clearQueryState.type: {
                const { queries: queriesToClear } = action;
                if (queriesToClear.length === 0) {
                    return state;
                }
                let newQueries = undefined;
                for (const { query: queryKey, cacheKey } of queriesToClear) {
                    const queryStates = (newQueries !== null && newQueries !== void 0 ? newQueries : state.queries)[queryKey];
                    if (cacheKey != null) {
                        if (queryStates[cacheKey]) {
                            newQueries !== null && newQueries !== void 0 ? newQueries : (newQueries = Object.assign({}, state.queries));
                            if (state.queries[queryKey] === newQueries[queryKey]) {
                                newQueries[queryKey] = Object.assign({}, newQueries[queryKey]);
                            }
                            delete newQueries[queryKey][cacheKey];
                        }
                    }
                    else if (queryStates !== utilsAndConstants_1.EMPTY_OBJECT) {
                        newQueries !== null && newQueries !== void 0 ? newQueries : (newQueries = Object.assign({}, state.queries));
                        newQueries[queryKey] = utilsAndConstants_1.EMPTY_OBJECT;
                    }
                }
                return newQueries === undefined
                    ? state
                    : Object.assign(Object.assign({}, state), { queries: newQueries });
            }
            case actions.clearMutationState.type: {
                const { mutationKeys } = action;
                if (mutationKeys.length === 0) {
                    return state;
                }
                let newMutations = undefined;
                for (const mutation of mutationKeys) {
                    if (state.mutations[mutation]) {
                        newMutations !== null && newMutations !== void 0 ? newMutations : (newMutations = Object.assign({}, state.mutations));
                        delete newMutations[mutation];
                    }
                }
                return newMutations === undefined
                    ? state
                    : Object.assign(Object.assign({}, state), { mutations: newMutations });
            }
            case actions.clearCache.type: {
                const { stateToKeep } = action;
                return stateToKeep
                    ? Object.assign(Object.assign({}, initialState), stateToKeep) : initialState;
            }
        }
        return state;
    };
};
exports.createCacheReducer = createCacheReducer;
