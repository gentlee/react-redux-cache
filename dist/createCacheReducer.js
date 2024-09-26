"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCacheReducer = void 0;
const utilsAndConstants_1 = require("./utilsAndConstants");
const EMPTY_QUERY_STATE = Object.freeze({});
const optionalQueryKeys = ['error', 'expiresAt', 'result', 'params'];
const optionalMutationKeys = ['error', 'result', 'params'];
const createCacheReducer = (actions, typenames, queryKeys, cacheOptions) => {
    const entitiesMap = {};
    for (const key in typenames) {
        entitiesMap[key] = EMPTY_QUERY_STATE;
    }
    const queryStateMap = {};
    for (const key of queryKeys) {
        queryStateMap[key] = {};
    }
    const mutationStateMap = {};
    const initialState = {
        entities: entitiesMap,
        queries: queryStateMap,
        mutations: mutationStateMap,
    };
    cacheOptions.logsEnabled &&
        (0, utilsAndConstants_1.log)('createCacheReducer', {
            typenames,
            queryKeys,
            initialState,
        });
    const deepEqual = cacheOptions.deepComparisonEnabled ? utilsAndConstants_1.optionalUtils.deepEqual : undefined;
    return (state = initialState, action) => {
        var _a, _b;
        switch (action.type) {
            case actions.updateQueryStateAndEntities.type: {
                const { queryKey, queryCacheKey, state: queryState, entityChanges, } = action;
                const oldQueryState = (_a = state.queries[queryKey][queryCacheKey]) !== null && _a !== void 0 ? _a : utilsAndConstants_1.DEFAULT_QUERY_MUTATION_STATE;
                let newQueryState = queryState && Object.assign(Object.assign({}, oldQueryState), queryState);
                // remove undefined optional fields
                if (newQueryState) {
                    for (const key of optionalQueryKeys) {
                        if (key in newQueryState && newQueryState[key] === undefined) {
                            delete newQueryState[key];
                        }
                    }
                }
                if (deepEqual === null || deepEqual === void 0 ? void 0 : deepEqual(oldQueryState, newQueryState)) {
                    newQueryState = undefined;
                }
                const newEntities = entityChanges && (0, utilsAndConstants_1.applyEntityChanges)(state.entities, entityChanges, cacheOptions);
                let newState;
                if (newEntities) {
                    newState !== null && newState !== void 0 ? newState : (newState = Object.assign({}, state));
                    newState.entities = newEntities;
                }
                if (newQueryState) {
                    newState !== null && newState !== void 0 ? newState : (newState = Object.assign({}, state));
                    newState.queries = Object.assign(Object.assign({}, state.queries), { [queryKey]: Object.assign(Object.assign({}, state.queries[queryKey]), { [queryCacheKey]: newQueryState }) });
                }
                return newState !== null && newState !== void 0 ? newState : state;
            }
            case actions.updateMutationStateAndEntities.type: {
                const { mutationKey, state: mutationState, entityChanges, } = action;
                const oldMutationState = (_b = state.mutations[mutationKey]) !== null && _b !== void 0 ? _b : utilsAndConstants_1.DEFAULT_QUERY_MUTATION_STATE;
                let newMutationState = mutationState && Object.assign(Object.assign({}, oldMutationState), mutationState);
                // remove undefined optional fields
                if (newMutationState) {
                    for (const key of optionalMutationKeys) {
                        if (key in newMutationState && newMutationState[key] === undefined) {
                            delete newMutationState[key];
                        }
                    }
                }
                if (deepEqual === null || deepEqual === void 0 ? void 0 : deepEqual(oldMutationState, newMutationState)) {
                    newMutationState = undefined;
                }
                const newEntities = entityChanges && (0, utilsAndConstants_1.applyEntityChanges)(state.entities, entityChanges, cacheOptions);
                let newState;
                if (newEntities) {
                    newState !== null && newState !== void 0 ? newState : (newState = Object.assign({}, state));
                    newState.entities = newEntities;
                }
                if (newMutationState) {
                    newState !== null && newState !== void 0 ? newState : (newState = Object.assign({}, state));
                    newState.mutations = Object.assign(Object.assign({}, state.mutations), { [mutationKey]: newMutationState });
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
                if (!queriesToInvalidate.length) {
                    return state;
                }
                const now = Date.now();
                let newQueries = undefined;
                for (const { key, cacheKey, expiresAt = now } of queriesToInvalidate) {
                    const queryStates = (newQueries !== null && newQueries !== void 0 ? newQueries : state.queries)[key];
                    if (cacheKey != null) {
                        if (queryStates[cacheKey]) {
                            const queryState = queryStates[cacheKey];
                            if (queryState && queryState.expiresAt !== expiresAt) {
                                newQueries !== null && newQueries !== void 0 ? newQueries : (newQueries = Object.assign({}, state.queries));
                                if (state.queries[key] === newQueries[key]) {
                                    newQueries[key] = Object.assign({}, newQueries[key]);
                                }
                                // @ts-expect-error fix type later
                                newQueries[key][cacheKey] = Object.assign(Object.assign({}, queryState), { expiresAt });
                                if (expiresAt === undefined) {
                                    delete newQueries[key][cacheKey].expiresAt;
                                }
                            }
                        }
                    }
                    else {
                        for (const cacheKey in queryStates) {
                            const queryState = queryStates[cacheKey];
                            if (queryState && queryState.expiresAt !== expiresAt) {
                                newQueries !== null && newQueries !== void 0 ? newQueries : (newQueries = Object.assign({}, state.queries));
                                if (state.queries[key] === newQueries[key]) {
                                    newQueries[key] = Object.assign({}, newQueries[key]);
                                }
                                newQueries[key][cacheKey] = Object.assign(Object.assign({}, queryState), { expiresAt });
                                if (expiresAt === undefined) {
                                    delete newQueries[key][cacheKey].expiresAt;
                                }
                            }
                        }
                    }
                }
                return !newQueries
                    ? state
                    : Object.assign(Object.assign({}, state), { queries: newQueries });
            }
            case actions.clearQueryState.type: {
                const { queries: queriesToClear } = action;
                if (!queriesToClear.length) {
                    return state;
                }
                let newQueries = undefined;
                for (const { key, cacheKey } of queriesToClear) {
                    const queryStates = (newQueries !== null && newQueries !== void 0 ? newQueries : state.queries)[key];
                    if (cacheKey != null) {
                        if (queryStates[cacheKey]) {
                            newQueries !== null && newQueries !== void 0 ? newQueries : (newQueries = Object.assign({}, state.queries));
                            if (state.queries[key] === newQueries[key]) {
                                newQueries[key] = Object.assign({}, newQueries[key]);
                            }
                            delete newQueries[key][cacheKey];
                        }
                    }
                    else if (queryStates !== EMPTY_QUERY_STATE) {
                        newQueries !== null && newQueries !== void 0 ? newQueries : (newQueries = Object.assign({}, state.queries));
                        newQueries[key] = EMPTY_QUERY_STATE;
                    }
                }
                return !newQueries
                    ? state
                    : Object.assign(Object.assign({}, state), { queries: newQueries });
            }
            case actions.clearMutationState.type: {
                const { mutationKeys } = action;
                if (!mutationKeys.length) {
                    return state;
                }
                let newMutations = undefined;
                for (const mutation of mutationKeys) {
                    if (state.mutations[mutation]) {
                        newMutations !== null && newMutations !== void 0 ? newMutations : (newMutations = Object.assign({}, state.mutations));
                        delete newMutations[mutation];
                    }
                }
                return !newMutations
                    ? state
                    : Object.assign(Object.assign({}, state), { mutations: newMutations });
            }
        }
        return state;
    };
};
exports.createCacheReducer = createCacheReducer;
