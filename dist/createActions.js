"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createActions = void 0;
const utilsAndConstants_1 = require("./utilsAndConstants");
const createActions = (name) => {
    const actionPrefix = `@${utilsAndConstants_1.PACKAGE_SHORT_NAME}/${name}/`;
    const updateQueryStateAndEntitiesType = `${actionPrefix}updateQueryStateAndEntities`;
    /** Updates query state, and optionally merges entity changes in a single action. */
    const updateQueryStateAndEntities = (queryKey, queryCacheKey, state, entityChagnes) => ({
        type: updateQueryStateAndEntitiesType,
        queryKey,
        queryCacheKey,
        state,
        entityChagnes,
    });
    updateQueryStateAndEntities.type = updateQueryStateAndEntitiesType;
    const updateMutationStateAndEntitiesType = `${actionPrefix}updateMutationStateAndEntities`;
    /** Updates mutation state, and optionally merges entity changes in a single action. */
    const updateMutationStateAndEntities = (mutationKey, state, entityChagnes) => ({
        type: updateMutationStateAndEntitiesType,
        mutationKey,
        state,
        entityChagnes,
    });
    updateMutationStateAndEntities.type = updateMutationStateAndEntitiesType;
    const mergeEntityChangesType = `${actionPrefix}mergeEntityChanges`;
    /** Merge EntityChanges to the state. */
    const mergeEntityChanges = (changes) => ({
        type: mergeEntityChangesType,
        changes,
    });
    mergeEntityChanges.type = mergeEntityChangesType;
    const clearQueryStateType = `${actionPrefix}clearQueryState`;
    /** Clear states for provided query keys and cache keys.
     * If cache key for query key is not provided, the whole state for query key is cleared. */
    const clearQueryState = (queryKeys) => ({
        type: clearQueryStateType,
        queryKeys,
    });
    clearQueryState.type = clearQueryStateType;
    const clearMutationStateType = `${actionPrefix}clearMutationState`;
    /** Clear states for provided mutation keys. */
    const clearMutationState = (mutationKeys) => ({
        type: clearMutationStateType,
        mutationKeys,
    });
    clearMutationState.type = clearMutationStateType;
    return {
        updateQueryStateAndEntities,
        updateMutationStateAndEntities,
        mergeEntityChanges,
        clearQueryState,
        clearMutationState,
    };
};
exports.createActions = createActions;
