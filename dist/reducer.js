"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCacheReducer = void 0;
const utilsAndConstants_1 = require("./utilsAndConstants");
const EMPTY_QUERY_STATE = Object.freeze({});
const createCacheReducer = (typenames, queries, mutations, cacheOptions) => {
    const entitiesMap = {};
    for (const key in typenames) {
        entitiesMap[key] = EMPTY_QUERY_STATE;
    }
    const queriesMap = {};
    for (const key in queries) {
        queriesMap[key] = {};
    }
    const mutationsMap = {};
    const initialState = {
        entities: entitiesMap,
        queries: queriesMap,
        mutations: mutationsMap,
    };
    cacheOptions.logsEnabled &&
        (0, utilsAndConstants_1.log)('createCacheReducer', {
            typenames,
            queries,
            mutations,
            initialState,
        });
    return (state = initialState, action) => {
        var _a, _b;
        switch (action.type) {
            case '@RRC/UPDATE_QUERY_STATE_AND_ENTITIES': {
                const { queryKey, queryCacheKey, state: queryState, entityChagnes } = action;
                const newEntities = entityChagnes && (0, utilsAndConstants_1.applyEntityChanges)(state.entities, entityChagnes, cacheOptions);
                if (!queryState && !newEntities) {
                    return state;
                }
                return Object.assign(Object.assign(Object.assign({}, state), (newEntities ? { entities: newEntities } : null)), { queries: Object.assign(Object.assign({}, state.queries), { [queryKey]: Object.assign(Object.assign({}, state.queries[queryKey]), { [queryCacheKey]: Object.assign(Object.assign({}, ((_a = state.queries[queryKey][queryCacheKey]) !== null && _a !== void 0 ? _a : utilsAndConstants_1.DEFAULT_QUERY_MUTATION_STATE)), queryState) }) }) });
            }
            case '@RRC/UPDATE_MUTATION_STATE_AND_ENTITIES': {
                const { mutationKey, state: mutationState, entityChagnes } = action;
                const newEntities = entityChagnes && (0, utilsAndConstants_1.applyEntityChanges)(state.entities, entityChagnes, cacheOptions);
                if (!mutationState && !newEntities) {
                    return state;
                }
                return Object.assign(Object.assign(Object.assign({}, state), (newEntities ? { entities: newEntities } : null)), { mutations: Object.assign(Object.assign({}, state.mutations), { [mutationKey]: Object.assign(Object.assign({}, ((_b = state.mutations[mutationKey]) !== null && _b !== void 0 ? _b : utilsAndConstants_1.DEFAULT_QUERY_MUTATION_STATE)), mutationState) }) });
            }
            case '@RRC/MERGE_ENTITY_CHANGES': {
                const { changes } = action;
                const newEntities = (0, utilsAndConstants_1.applyEntityChanges)(state.entities, changes, cacheOptions);
                return newEntities ? Object.assign(Object.assign({}, state), { entities: newEntities }) : state;
            }
            case '@RRC/CLEAR_QUERY_STATE': {
                const { queryKeys } = action;
                if (!queryKeys.length) {
                    return state;
                }
                let newQueries = undefined;
                for (const query of queryKeys) {
                    if (query.cacheKey != null) {
                        if ((newQueries !== null && newQueries !== void 0 ? newQueries : state.queries)[query.key][query.cacheKey]) {
                            newQueries !== null && newQueries !== void 0 ? newQueries : (newQueries = Object.assign({}, state.queries));
                            newQueries[query.key] = Object.assign({}, newQueries[query.key]);
                            delete newQueries[query.key][query.cacheKey];
                        }
                    }
                    else if ((newQueries !== null && newQueries !== void 0 ? newQueries : state.queries)[query.key] !== EMPTY_QUERY_STATE) {
                        newQueries !== null && newQueries !== void 0 ? newQueries : (newQueries = Object.assign({}, state.queries));
                        newQueries[query.key] = EMPTY_QUERY_STATE;
                    }
                }
                if (!newQueries) {
                    return state;
                }
                return Object.assign(Object.assign({}, state), { queries: newQueries });
            }
            case '@RRC/CLEAR_MUTATION_STATE': {
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
                if (!newMutations) {
                    return state;
                }
                return Object.assign(Object.assign({}, state), { mutations: newMutations });
            }
        }
        return state;
    };
};
exports.createCacheReducer = createCacheReducer;
