"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeEntityChanges = exports.setMutationStateAndEntities = exports.setQueryStateAndEntities = exports.createCacheReducer = void 0;
const utilsAndConstants_1 = require("./utilsAndConstants");
const createCacheReducer = (typenames, queries, mutations, cacheOptions) => {
    const entitiesMap = {};
    for (const key in typenames) {
        entitiesMap[key] = {};
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
        switch (action.type) {
            case '@RRC/SET_QUERY_STATE_AND_ENTITIES': {
                const { queryKey, queryCacheKey, state: queryState, entityChagnes } = action;
                const newEntities = entityChagnes && (0, utilsAndConstants_1.processEntityChanges)(state.entities, entityChagnes, cacheOptions);
                if (!queryState && !newEntities) {
                    return state;
                }
                return Object.assign(Object.assign(Object.assign({}, state), (newEntities ? { entities: newEntities } : null)), { queries: Object.assign(Object.assign({}, state.queries), { [queryKey]: Object.assign(Object.assign({}, state.queries[queryKey]), { [queryCacheKey]: Object.assign(Object.assign({}, state.queries[queryKey][queryCacheKey]), queryState) }) }) });
            }
            case '@RRC/SET_MUTATION_STATE_AND_ENTITIES': {
                const { mutationKey, state: mutationState, entityChagnes } = action;
                const newEntities = entityChagnes && (0, utilsAndConstants_1.processEntityChanges)(state.entities, entityChagnes, cacheOptions);
                if (!mutationState && !newEntities) {
                    return state;
                }
                return Object.assign(Object.assign(Object.assign({}, state), (newEntities ? { entities: newEntities } : null)), { mutations: Object.assign(Object.assign({}, state.mutations), { [mutationKey]: Object.assign(Object.assign({}, state.mutations[mutationKey]), mutationState) }) });
            }
            case '@RRC/MERGE_ENTITY_CHANGES': {
                const { changes } = action;
                const newEntities = (0, utilsAndConstants_1.processEntityChanges)(state.entities, changes, cacheOptions);
                return newEntities ? Object.assign(Object.assign({}, state), { entities: newEntities }) : state;
            }
        }
        return state;
    };
};
exports.createCacheReducer = createCacheReducer;
const actionPrefix = `@${utilsAndConstants_1.PACKAGE_SHORT_NAME}/`;
const setQueryStateAndEntities = (queryKey, queryCacheKey, state, entityChagnes) => ({
    type: `${actionPrefix}SET_QUERY_STATE_AND_ENTITIES`,
    queryKey,
    queryCacheKey,
    state,
    entityChagnes,
});
exports.setQueryStateAndEntities = setQueryStateAndEntities;
const setMutationStateAndEntities = (mutationKey, state, entityChagnes) => ({
    type: `${actionPrefix}SET_MUTATION_STATE_AND_ENTITIES`,
    mutationKey,
    state,
    entityChagnes,
});
exports.setMutationStateAndEntities = setMutationStateAndEntities;
const mergeEntityChanges = (changes) => ({
    type: `${actionPrefix}MERGE_ENTITY_CHANGES`,
    changes,
});
exports.mergeEntityChanges = mergeEntityChanges;
