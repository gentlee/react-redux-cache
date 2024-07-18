"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearMutationState = exports.clearQueryState = exports.mergeEntityChanges = exports.updateMutationStateAndEntities = exports.updateQueryStateAndEntities = void 0;
const utilsAndConstants_1 = require("./utilsAndConstants");
const ACTION_PREFIX = `@${utilsAndConstants_1.PACKAGE_SHORT_NAME}/`;
const updateQueryStateAndEntities = (queryKey, queryCacheKey, state, entityChagnes) => ({
    type: `${ACTION_PREFIX}UPDATE_QUERY_STATE_AND_ENTITIES`,
    queryKey,
    queryCacheKey,
    state,
    entityChagnes,
});
exports.updateQueryStateAndEntities = updateQueryStateAndEntities;
const updateMutationStateAndEntities = (mutationKey, state, entityChagnes) => ({
    type: `${ACTION_PREFIX}UPDATE_MUTATION_STATE_AND_ENTITIES`,
    mutationKey,
    state,
    entityChagnes,
});
exports.updateMutationStateAndEntities = updateMutationStateAndEntities;
const mergeEntityChanges = (changes) => ({
    type: `${ACTION_PREFIX}MERGE_ENTITY_CHANGES`,
    changes,
});
exports.mergeEntityChanges = mergeEntityChanges;
const clearQueryState = (queryKeys) => ({
    type: `${ACTION_PREFIX}CLEAR_QUERY_STATE`,
    queryKeys,
});
exports.clearQueryState = clearQueryState;
const clearMutationState = (mutationKeys) => ({
    type: `${ACTION_PREFIX}CLEAR_MUTATION_STATE`,
    mutationKeys,
});
exports.clearMutationState = clearMutationState;
